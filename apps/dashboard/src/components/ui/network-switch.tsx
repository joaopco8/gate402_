"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";

const SwitchContext = createContext<{
  value: string | null;
  setValue: React.Dispatch<React.SetStateAction<string | null>>;
} | null>(null);

interface SwitchProps {
  children: React.ReactNode;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

export const NetworkSwitch = ({ children, defaultValue, onChange }: SwitchProps) => {
  const [value, setValue] = useState<string | null>(defaultValue ?? null);

  const handleSet: React.Dispatch<React.SetStateAction<string | null>> = (next) => {
    setValue(next);
    const resolved = typeof next === "function" ? next(value) : next;
    if (resolved && onChange) onChange(resolved);
  };

  useEffect(() => {
    if (defaultValue !== undefined) setValue(defaultValue);
  }, [defaultValue]);

  return (
    <SwitchContext.Provider value={{ value, setValue: handleSet }}>
      <div
        className={clsx(
          "flex bg-background-100 p-1 border border-gray-alpha-400 h-10 rounded-md w-fit"
        )}
      >
        {React.Children.map(children, (child) =>
          React.cloneElement(child as React.ReactElement<SwitchControlProps>, {})
        )}
      </div>
    </SwitchContext.Provider>
  );
};

interface SwitchControlProps {
  label: string;
  value: string;
  disabled?: boolean;
}

const SwitchControl = ({ label, value, disabled = false }: SwitchControlProps) => {
  const context = useContext(SwitchContext);
  const checked = value === context?.value;

  return (
    <label
      className={clsx("flex flex-1 h-full", disabled && "cursor-not-allowed pointer-events-none")}
      onClick={() => !disabled && context?.setValue(value)}
    >
      <input type="radio" value={value} checked={checked} readOnly className="hidden" />
      <span
        className={twMerge(clsx(
          "flex items-center justify-center flex-1 cursor-pointer font-medium font-sans duration-150 text-sm px-4 rounded-sm select-none",
          disabled && "cursor-not-allowed opacity-50"
        ))}
        style={checked
          ? { background: '#006239', border: '0.5px solid #128353', borderRadius: 4, color: '#fff' }
          : { background: 'transparent', color: 'var(--text-secondary)' }
        }
      >
        {label}
      </span>
    </label>
  );
};

NetworkSwitch.Control = SwitchControl;
