import axios from "axios";
import { assertExists } from "../utils";

async function setMonitorStatus(id: string, status: boolean) {
  const data = new URLSearchParams({
    api_key: assertExists(process.env.UPTIMEROBOT_API_KEY),
    id,
    format: "json",
    status: status ? "1" : "0",
  });

  return await axios.post("https://api.uptimerobot.com/v2/editMonitor", data);
}

export async function startMonitoring() {
  return await setMonitorStatus(
    assertExists(process.env.UPTIMEROBOT_MONITOR_ID),
    true
  );
}

export async function stopMonitoring() {
  return await setMonitorStatus(
    assertExists(process.env.UPTIMEROBOT_MONITOR_ID),
    false
  );
}
