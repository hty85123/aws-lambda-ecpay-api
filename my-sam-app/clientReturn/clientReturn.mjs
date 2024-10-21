export const handler = async (event) => {
  const response = {
    statusCode: 302,
    headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        "Location": "http://localhost:3000" //Redirect Location
    }
  };

  return response;
};

