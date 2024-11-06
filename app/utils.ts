export const readStreamingApiResponse = async (response: any) => {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder("utf-8");
  let result = "";
  if (response.ok && reader && decoder) {
    let partialData = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const decodedValue = decoder.decode(value, { stream: true });
      partialData += decodedValue;
      let lines = partialData.split("\n");
      partialData = lines.pop() || "";
      for (let line of lines) {
        line = line.trim();
        if (line.startsWith("data:")) {
          const jsonString = line.slice("data:".length).trim();
          if (jsonString === "[DONE]") {
            break;
          }
          try {
            const parsedJson = JSON.parse(jsonString);
            if (parsedJson.status === "ok") {
              result = result + parsedJson["out-1"];
            }
          } catch (error) {}
        }
      }
    }
  }
  return result;
};
