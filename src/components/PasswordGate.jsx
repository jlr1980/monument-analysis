import { useState } from "react";
import { PASSWORD_HASH, STORAGE_KEYS } from "../lib/defaults.js";

async function sha256Hex(input) {
  const buf = new TextEncoder().encode(input);
  const hashBuf = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export default function PasswordGate({ children }) {
  const [unlocked, setUnlocked] = useState(
    () => localStorage.getItem(STORAGE_KEYS.unlocked) === "true"
  );
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(false);

  if (unlocked) return children;

  const onSubmit = async (e) => {
    e.preventDefault();
    const hash = await sha256Hex(value);
    if (hash === PASSWORD_HASH) {
      localStorage.setItem(STORAGE_KEYS.unlocked, "true");
      setUnlocked(true);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 400);
      setValue("");
    }
  };

  const onForget = (e) => {
    e.preventDefault();
    localStorage.removeItem(STORAGE_KEYS.unlocked);
    setUnlocked(false);
    setValue("");
  };

  return (
    <div className="gate-screen">
      <form
        className={`gate-form ${shake ? "gate-shake" : ""}`}
        onSubmit={onSubmit}
      >
        <input
          className="gate-input"
          type="text"
          placeholder="the word"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoFocus
          autoComplete="off"
          spellCheck={false}
        />
        <button className="gate-button" type="submit">
          Open
        </button>
      </form>
      <a className="gate-forget" href="#" onClick={onForget}>
        forget me
      </a>
    </div>
  );
}
