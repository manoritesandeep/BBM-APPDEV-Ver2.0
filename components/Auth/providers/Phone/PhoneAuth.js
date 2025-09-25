import React from "react";
import { PhoneAuthScreen } from "./components";

function PhoneAuth({
  isSignUp = false,
  onSuccess = () => {},
  onBack = () => {},
  initialData = {},
}) {
  return (
    <PhoneAuthScreen
      isSignUp={isSignUp}
      onSuccess={onSuccess}
      onBack={onBack}
      initialData={initialData}
    />
  );
}

export default PhoneAuth;
