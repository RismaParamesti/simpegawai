import { useState } from "react";
import EyeIcon from "@heroicons/react/24/solid/EyeIcon";
import EyeSlashIcon from "@heroicons/react/24/solid/EyeSlashIcon";

function PasswordInput({
  value,
  onChange,
  placeholder,
  className,
  autoComplete,
  name,
  id,
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative w-full">
      <input
        id={id}
        name={name}
        type={showPassword ? "text" : "password"}
        value={value}
        placeholder={placeholder || ""}
        autoComplete={autoComplete}
        onChange={onChange}
        className={`app-password-input ${className || "input input-bordered w-full"} pr-12`}
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-primary/10 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
        title={showPassword ? "Sembunyikan password" : "Tampilkan password"}
      >
        {showPassword ? (
          <EyeSlashIcon className="h-5 w-5" />
        ) : (
          <EyeIcon className="h-5 w-5" />
        )}
      </button>
    </div>
  );
}

export default PasswordInput;
