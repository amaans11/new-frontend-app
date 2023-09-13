// const apiUrl = "https://c3theanswer.com/api";
const apiUrl = 'http://localhost:6060/api'

export const getData = async (accessToken) => {
  const url = `${apiUrl}/data/tableData`;
  try {
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    };
    return fetch(url, options)
      .then((response) => {
        if (!response.ok) throw new Error("bad server/client response");
        return response.json();
      })
      .then((responseData) => {
        if (responseData?.data) {
          return responseData.data;
        } else {
          throw new Error("bad json response");
        }
      });
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const addSavedFilter = async (accessToken, filterDefs, displayName) => {
  const url = `${apiUrl}/data/saveFilter`;
  const body = JSON.stringify({
    filterJson: filterDefs,
    displayName,
  });
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body,
  };
  try {
    return fetch(url, options)
      .then((response) => {
        if (!response.ok) throw new Error("bad server/client response");
        return response.json();
      })
      .then((responseData) => {
        if (responseData?.data) {
          return responseData.data;
        } else {
          throw new Error("bad json response");
        }
      });
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const getSavedFilters = async (accessToken) => {
  const url = `${apiUrl}/data/getFilters`;
  const options = {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  try {
    return fetch(url, options)
      .then((response) => {
        if (!response.ok) throw new Error("bad server/client response");
        return response.json();
      })
      .then((responseData) => {
        if (responseData?.data) {
          return responseData.data;
        } else {
          throw new Error("bad json response");
        }
      });
  } catch (err) {
    console.error(err);
    return null;
  }
};

export const deleteSavedFilter = async (accessToken, filterUUID) => {
  const url = `${apiUrl}/data/deleteFilter/${filterUUID}`;
  const options = {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };
  try {
    return fetch(url, options)
      .then((response) => {
        if (!response.ok) throw new Error("bad server/client response");
        return response.json();
      })
      .then((responseData) => {
        if (responseData?.data) {
          return responseData.data;
        } else {
          throw new Error("bad json response");
        }
      });
  } catch (err) {
    console.error(err);
    return null;
  }
};
