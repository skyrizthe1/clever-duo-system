
import React, { forwardRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface ReCaptchaProps {
  onVerify: (token: string | null) => void;
  onExpire?: () => void;
  onError?: () => void;
  theme?: 'light' | 'dark';
  size?: 'compact' | 'normal' | 'invisible';
}

const ReCaptcha = forwardRef<ReCAPTCHA, ReCaptchaProps>(({
  onVerify,
  onExpire,
  onError,
  theme = 'light',
  size = 'normal'
}, ref) => {
  // Using a test site key for development
  // In production, you should set this as an environment variable
  const siteKey = '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI';

  return (
    <ReCAPTCHA
      ref={ref}
      sitekey={siteKey}
      onChange={onVerify}
      onExpired={onExpire}
      onErrored={onError}
      theme={theme}
      size={size}
    />
  );
});

ReCaptcha.displayName = 'ReCaptcha';

export default ReCaptcha;
