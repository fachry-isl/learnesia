import React from "react";
import { geminiApiRequest, createCourse } from "../services/api";
import { useState } from "react";
import { SpinnerDotted } from "spinners-react";

const IntegrationSandbox = () => {
  const [output, setOutput] = useState("");
  const [isLoading, setLoading] = useState(false);

  const fetchAnyApi = async (query) => {
    // const response = await geminiApiRequest(query);
    // setOutput(response.bot_response);
    try {
      setOutput("");
      setLoading(true);

      const response = await createCourse();
      // Wait 5 seconds before showing the result
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setOutput(JSON.stringify(response));
    } catch (error) {
      setOutput(`Error: ${error.message} - Check your internet connection`);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleIntegrationSubmit = (e) => {
    // Prevent window refresh
    e.preventDefault();

    const query = e.target.query.value;
    // window.alert(query);

    fetchAnyApi(query);
  };

  return (
    <div className="flex flex-col h-full">
      <form onSubmit={handleIntegrationSubmit}>
        <div className="text-black">Query:</div>
        <input
          name="query"
          className="border-2 border-black w-full text-black p-5 resize-none"
          required
        ></input>

        <button
          type="submit"
          className="border-black border-2 text-black p-2 mt-5 cursor-pointer"
        >
          Submit
        </button>
      </form>

      {/* Loading and Output Container */}
      <div
        className={`border-2 border-black flex flex-col flex-1 mt-5 ${
          isLoading ? "flex items-center justify-center" : ""
        }`}
      >
        {isLoading ? (
          <SpinnerDotted color="#000000" size="100" />
        ) : (
          <SpinnerDotted enabled={false} />
        )}

        {output && (
          <>
            <div className="text-black">Output: </div>
            <div className="text-black">{output}</div>
          </>
        )}
      </div>
    </div>
  );
};

export default IntegrationSandbox;
