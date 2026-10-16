import { preload } from "react-dom";
import Home from "./Home";

export default function Page() {
  // Start downloading the schedule alongside the page's JavaScript instead
  // of waiting for the client to hydrate and call fetch(). The options match
  // useSchedule's plain same-origin fetch so the browser reuses this response.
  preload("/api/schedule", { as: "fetch", crossOrigin: "anonymous" });

  return <Home />;
}
