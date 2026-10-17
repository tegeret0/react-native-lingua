import { useSignIn, useSignUp } from "@clerk/expo";
import { useSSO } from "@clerk/expo/experimental";
import { useEffect, useRef, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Link, useRouter } from "expo-router";

import { images } from "../../constants/images";

type AuthScreenProps = {
  mode: "sign-up" | "sign-in";
};

const socialOptions = [
  { name: "Google", mark: "G", color: "#4285F4", strategy: "oauth_google" },
  { name: "Facebook", mark: "f", color: "#1877F2", strategy: "oauth_facebook" },
  { name: "Apple", mark: "●", color: "#0D132B", strategy: "oauth_apple" },
] as const;

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null) {
    const clerkErrors = (error as { errors?: { longMessage?: string; message?: string }[] }).errors;
    const firstError = clerkErrors?.[0];
    if (firstError?.longMessage || firstError?.message) {
      const message = firstError.longMessage ?? firstError.message ?? "Unable to authenticate.";
      if (/username/i.test(message)) {
        return "Clerk is still requiring a username. Disable the username sign-up requirement in your Clerk Dashboard; this app uses email and password only.";
      }
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to authenticate. Please try again.";
}

export default function AuthScreen({ mode }: AuthScreenProps) {
  const router = useRouter();
  const codeInput = useRef<TextInput>(null);
  const isVerifying = useRef(false);
  const isFinalizing = useRef(false);
  const { signUp, fetchStatus: signUpFetchStatus } = useSignUp();
  const { signIn, fetchStatus: signInFetchStatus } = useSignIn();
  const { startSSOFlow } = useSSO();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verificationVisible, setVerificationVisible] = useState(false);
  const [code, setCode] = useState("");
  const [verificationFlow, setVerificationFlow] = useState<"sign-up" | "sign-in-mfa">("sign-up");
  const [verificationAccepted, setVerificationAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSocialLoading, setIsSocialLoading] = useState(false);
  const isSignUp = mode === "sign-up";
  const isLoading =
    signUpFetchStatus === "fetching" ||
    signInFetchStatus === "fetching" ||
    isSocialLoading;

  async function submitCredentials() {
    const emailAddress = email.trim();
    if (!emailAddress) {
      setErrorMessage("Enter your email address and password to continue.");
      return;
    }
    if (!password) {
      setErrorMessage("Enter your password to continue.");
      return;
    }

    setErrorMessage("");
    setCode("");
    setVerificationAccepted(false);
    isVerifying.current = false;

    try {
      if (isSignUp) {
        const { error } = await signUp.password({ emailAddress, password });
        if (error) {
          setErrorMessage(getErrorMessage(error));
          return;
        }

        const { error: sendError } = await signUp.verifications.sendEmailCode();
        if (sendError) {
          setErrorMessage(getErrorMessage(sendError));
          return;
        }
        setVerificationFlow("sign-up");
      } else {
        const { error } = await signIn.password({ emailAddress, password });
        if (error) {
          setErrorMessage(getErrorMessage(error));
          return;
        }

        if (signIn.status === "complete") {
          await finalizeAuthentication();
          return;
        }

        const emailFactor = signIn.supportedSecondFactors?.find(
          (factor) => factor.strategy === "email_code",
        );
        if (
          (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") &&
          emailFactor
        ) {
          const { error: sendError } = await signIn.mfa.sendEmailCode();
          if (sendError) {
            setErrorMessage(getErrorMessage(sendError));
            return;
          }
          setVerificationFlow("sign-in-mfa");
        } else {
          setErrorMessage("Your account needs an additional sign-in method. Check your Clerk settings.");
          return;
        }
      }

      setVerificationVisible(true);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    }
  }

  async function finalizeAuthentication() {
    if (isFinalizing.current) return;

    const isComplete = isSignUp
      ? signUp.status === "complete" && Boolean(signUp.createdSessionId)
      : signIn.status === "complete" && Boolean(signIn.createdSessionId);

    if (!isComplete) {
      setErrorMessage("Your account is still being verified. Please try again in a moment.");
      return;
    }

    isFinalizing.current = true;
    try {
      const { error } = isSignUp
        ? await signUp.finalize()
        : await signIn.finalize();
      if (error) {
        isFinalizing.current = false;
        setErrorMessage(getErrorMessage(error));
        return;
      }

      setVerificationVisible(false);
      setCode("");
      router.replace("/");
    } catch (error) {
      isFinalizing.current = false;
      setErrorMessage(getErrorMessage(error));
    }
  }

  async function verifyCode(value: string) {
    if (isVerifying.current) return;
    isVerifying.current = true;
    setErrorMessage("");

    try {
      const { error } = verificationFlow === "sign-up"
        ? await signUp.verifications.verifyEmailCode({ code: value })
        : await signIn.mfa.verifyEmailCode({ code: value });

      if (error) {
        setErrorMessage(getErrorMessage(error));
        return;
      }

      setVerificationAccepted(true);

    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      isVerifying.current = false;
    }
  }

  function updateCode(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 6);
    setCode(digits);
    setErrorMessage("");
    if (digits.length === 6) {
      void verifyCode(digits);
    }
  }

  async function signInWithSocialProvider(strategy: (typeof socialOptions)[number]["strategy"]) {
    setIsSocialLoading(true);
    setErrorMessage("");

    try {
      const { createdSessionId } = await startSSOFlow({ strategy });
      if (createdSessionId) {
        router.replace("/");
      }
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSocialLoading(false);
    }
  }

  useEffect(() => {
    if (!verificationVisible || !verificationAccepted) return;

    if (
      verificationFlow === "sign-up" &&
      signUp.status === "complete" &&
      signUp.createdSessionId
    ) {
      void finalizeAuthentication();
    } else if (verificationFlow === "sign-up" && signUp.status === "missing_requirements") {
      const remainingFields = [...signUp.missingFields, ...signUp.unverifiedFields];
      const usernameIsRequired = remainingFields.some((field) => /username/i.test(field));
      setErrorMessage(
        usernameIsRequired
          ? "Your email is verified, but Clerk still requires a username. Disable the username sign-up requirement in your Clerk Dashboard; this app only collects email, password, and verification code."
          : remainingFields.length > 0
          ? `Your email is verified, but these account details are still required: ${remainingFields.join(", ")}.`
          : "Your email is verified, but Clerk still requires more account details.",
      );
    }

    if (
      verificationFlow === "sign-in-mfa" &&
      signIn.status === "complete" &&
      signIn.createdSessionId
    ) {
      void finalizeAuthentication();
    }
  }, [signIn, signUp, verificationAccepted, verificationFlow, verificationVisible]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow px-7 pb-7"
        keyboardShouldPersistTaps="handled"
      >
        <Link href="/onboarding" asChild>
          <Pressable className="mt-5 h-11 w-11 justify-center" accessibilityLabel="Back">
            <Text className="text-[36px] leading-[40px] text-text-primary">‹</Text>
          </Pressable>
        </Link>

        <View className="mt-7">
          <Text className="font-poppins-semibold text-[28px] leading-[36px] text-text-primary">
            {isSignUp ? "Create your account" : "Welcome back"}
          </Text>
          <Text className="mt-3 font-poppins text-[17px] leading-[26px] text-text-secondary">
            {isSignUp ? "Start your language journey today ✨" : "Continue your language journey ✨"}
          </Text>
        </View>

        <View className="mt-4 h-[190px] items-center justify-end overflow-hidden">
          <Image source={images.mascotAuth} className="h-full w-full" resizeMode="contain" />
        </View>

        <View className="mt-1 rounded-[20px] border border-[#E9EBF1] px-5 py-4">
          <Text className="font-poppins text-[14px] text-text-secondary">Email</Text>
          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            placeholderTextColor="#9AA1B2"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            className="mt-2 p-0 font-poppins text-[18px] text-text-primary"
            accessibilityLabel="Email address"
          />
        </View>

        <View className="mt-3 rounded-[20px] border border-[#E9EBF1] px-5 py-4">
          <Text className="font-poppins text-[14px] text-text-secondary">Password</Text>
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#9AA1B2"
            autoCapitalize="none"
            autoComplete={isSignUp ? "new-password" : "password"}
            secureTextEntry
            className="mt-2 p-0 font-poppins text-[18px] text-text-primary"
            accessibilityLabel="Password"
          />
        </View>

        {errorMessage ? (
          <Text accessibilityRole="alert" className="mt-3 font-poppins text-[14px] text-[#D92D20]">
            {errorMessage}
          </Text>
        ) : null}

        <Pressable
          onPress={() => void submitCredentials()}
          disabled={isLoading}
          className={`mt-5 h-[74px] items-center justify-center rounded-[18px] bg-brand-purple ${isLoading ? "opacity-60" : ""}`}
        >
          <Text className="font-poppins-semibold text-[21px] text-white">
            {isSignUp ? "Sign Up" : "Sign In"}
          </Text>
        </Pressable>

        <View className="my-7 flex-row items-center gap-4">
          <View className="h-px flex-1 bg-[#E5E7EB]" />
          <Text className="font-poppins text-[15px] text-text-secondary">or continue with</Text>
          <View className="h-px flex-1 bg-[#E5E7EB]" />
        </View>

        <View className="gap-3">
          {socialOptions.map((option) => (
            <Pressable
              key={option.name}
              onPress={() => void signInWithSocialProvider(option.strategy)}
              disabled={isLoading}
              className={`h-[68px] flex-row items-center justify-center gap-5 rounded-[18px] border border-[#ECEEF3] ${isLoading ? "opacity-60" : ""}`}
              accessibilityRole="button"
              accessibilityLabel={`Continue with ${option.name}`}
            >
              <Text
                className="w-6 text-center text-[27px] font-bold"
                style={{ color: option.color }}
              >
                {option.mark}
              </Text>
              <Text className="font-poppins-medium text-[17px] text-text-primary">
                Continue with {option.name}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="mt-auto flex-row flex-wrap justify-center pt-8">
          <Text className="font-poppins text-[16px] text-text-secondary">
            {isSignUp ? "Already have an account? " : "New to muolingo? "}
          </Text>
          <Link href={isSignUp ? "/sign-in" : "/sign-up"}>
            <Text className="font-poppins-medium text-[16px] text-brand-purple">
              {isSignUp ? "Log in" : "Sign up"}
            </Text>
          </Link>
        </View>
      </ScrollView>

      {isSignUp ? <View nativeID="clerk-captcha" /> : null}

      <Modal
        visible={verificationVisible}
        transparent
        animationType="fade"
        statusBarTranslucent
        onShow={() => setTimeout(() => codeInput.current?.focus(), 150)}
        onRequestClose={() => setVerificationVisible(false)}
      >
        <KeyboardAvoidingView
          className="flex-1 justify-end bg-black/40"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <Pressable className="flex-1" onPress={() => setVerificationVisible(false)} />
          <View className="rounded-t-[28px] bg-white px-7 pb-10 pt-8">
            <View className="mb-6 h-1 w-12 self-center rounded-full bg-[#E5E7EB]" />
            <Text className="text-center font-poppins-semibold text-[24px] text-text-primary">
              Check your email
            </Text>
            <Text className="mt-3 text-center font-poppins text-[16px] leading-6 text-text-secondary">
              We sent you an email. Enter the 6-digit verification code to continue.
            </Text>
            <View className="relative mt-8 flex-row justify-center gap-2">
              {Array.from({ length: 6 }, (_, index) => (
                <View
                  key={index}
                  className={`h-14 w-11 items-center justify-center rounded-xl border ${index === code.length ? "border-brand-purple" : "border-[#E5E7EB]"}`}
                >
                  <Text className="font-poppins-semibold text-[22px] text-text-primary">
                    {code[index] ?? ""}
                  </Text>
                </View>
              ))}
              <TextInput
                ref={codeInput}
                value={code}
                onChangeText={updateCode}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                maxLength={6}
                autoFocus
                caretHidden
                className="absolute inset-0 opacity-[0.02]"
                accessibilityLabel="6-digit verification code"
              />
            </View>
            {errorMessage ? (
              <Text accessibilityRole="alert" className="mt-4 text-center font-poppins text-[14px] text-[#D92D20]">
                {errorMessage}
              </Text>
            ) : null}
            <Pressable
              onPress={() => setVerificationVisible(false)}
              className="mt-7 items-center py-3"
            >
              <Text className="font-poppins-medium text-[15px] text-brand-purple">Cancel</Text>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
