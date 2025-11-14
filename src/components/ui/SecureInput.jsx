import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { securityChecks, escapeHTML } from "@/components/utils/security";

/**
 * Secure Input Component with validation
 */
export default function SecureInput({
  value,
  onChange,
  enableSecurityChecks = true,
  maxLength = 1000,
  allowHTML = false,
  ...props
}) {
  const [securityWarning, setSecurityWarning] = useState(null);

  const handleChange = (e) => {
    const newValue = e.target.value;

    // Length validation
    if (newValue.length > maxLength) {
      setSecurityWarning(`Maximum length exceeded (${maxLength} characters)`);
      return;
    }

    // Security checks
    if (enableSecurityChecks) {
      if (!securityChecks.validateInput(newValue)) {
        setSecurityWarning('Potentially unsafe input detected');
        return;
      }
    }

    // Clear warnings
    setSecurityWarning(null);

    // Sanitize if HTML not allowed
    const sanitizedValue = allowHTML ? newValue : escapeHTML(newValue);

    onChange(sanitizedValue);
  };

  return (
    <div className="space-y-2">
      <Input
        value={value}
        onChange={handleChange}
        {...props}
      />
      {securityWarning && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {securityWarning}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}