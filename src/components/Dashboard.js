import { useAuth0 } from "@auth0/auth0-react";
import {
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  InputLabel,
  ListItemText,
  makeStyles,
  MenuItem,
  Select,
  Slider,
  TextField,
  withStyles,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import { getData } from "../services/requests";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import MUIDataTable from "mui-datatables";
import MarketCapLowFilter from "./MarketCapLowFIlter";
import { debounce } from "lodash";
import { AutoSizer, List } from 'react-virtualized';

const Dashboard = () => {
  const { getAccessTokenSilently } = useAuth0();

  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [columnRange, setColumnRange] = useState({});
  const styles = useStyles();

  useEffect(async () => {
    console.log("test");
    setLoading(true);
    const token = await getAccessTokenSilently();
    const data = await getData(token);

    console.log("daata>>", data);
    if (data && data.rows && data.rows.length > 0) {
      setTableData(data.rows);
      let columnRange = {};
      // Initialize min and max values for each key
      data.rows.forEach((item) => {
        for (const key in item) {
          if (!(key in columnRange)) {
            columnRange[key] = {
              min: Number.MAX_SAFE_INTEGER,
              max: Number.MIN_SAFE_INTEGER,
            };
          }
        }
      });

      // Iterate through the records and update min and max values
      data.rows.forEach((item) => {
        for (const key in item) {
          const value = item[key];
          const keyData = columnRange[key];
          keyData.min = Math.min(keyData.min, value);
          keyData.max = Math.max(keyData.max, value);
        }
      });
      setColumnRange(columnRange);
    } else {
      setTableData([]);
    }
    setLoading(false);
  }, []);

  const columns = [
    {
      name: "CaseID",
      label: "Case Id",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => (
          <div className="text-center text-sm">{value}</div>
        ),
      },
    },
    {
      name: "CaseName",
      label: "CaseName",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => (
          <div className="text-center text-sm">{value}</div>
        ),
      },
    },
    {
      name: "CaseStatus",
      label: "Case Status",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => {
          if (value === "Active") {
            return <div className="custom-pill active-pill">{value}</div>;
          } else if (value === "Settled") {
            return <div className="custom-pill settled-pill">{value}</div>;
          } else if (value === "Class certified") {
            return (
              <div className="custom-pill class-certified-pill">{value}</div>
            );
          } else {
            return <div className="custom-pill dismissed-pill">{value}</div>;
          }
        },
      },
    },
    {
      name: "FederalFilingDate",
      label: "Federal Filing Date",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => (
          <div className="text-center text-sm">{value}</div>
        ),
      },
    },
    {
      name: "SICCode",
      label: "SIC Code",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => (
          <div className="text-center text-sm">{value}</div>
        ),
      },
    },
    {
      name: "WhySuedCategory",
      label: "Why Sued",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => (
          <div className="text-center text-sm">{value ? value : "-"}</div>
        ),
      },
    },
    {
      name: "WhySuedAllegations",
      label: "Why Sued Allegations",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => (
          <div className="text-center text-sm">{value ? value : "-"}</div>
        ),
      },
    },
    {
      name: "MarketCapHigh",
      label: "Market Cap High",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => (
          <div className="text-center text-sm">
            {value ? value.toLocaleString("en") : "NA"}
          </div>
        ),
      },
    },
    {
      name: "MarketCapLow",
      label: "Market Cap Low",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => (
          <div className="text-center text-sm">
            {value ? value.toLocaleString("en") : "NA"}
          </div>
        ),
        filterType: "custom",
        customFilterListOptions: {
          render: (v) => {
            if (v[0] && v[1]) {
              return [
                `Min Market Cap Low": ${v[0]}`,
                `Max Market Cap Low": ${v[1]}`,
              ];
            } else if (v[0] && v[1]) {
              return `Min Market Cap Low": ${v[0]}, Max Market Cap Low": ${v[1]}`;
            } else if (v[0]) {
              return `Min Market Cap Low": ${v[0]}`;
            } else if (v[1]) {
              return `Max Market Cap Low": ${v[1]}`;
            }
            return [];
          },
          update: (filterList, filterPos, index) => {
            console.log(
              "customFilterListOnDelete: ",
              filterList,
              filterPos,
              index
            );

            if (filterPos === 0) {
              filterList[index].splice(filterPos, 1, "");
            } else if (filterPos === 1) {
              filterList[index].splice(filterPos, 1);
            } else if (filterPos === -1) {
              filterList[index] = [];
            }

            return filterList;
          },
        },
        filterOptions: {
          names: [],
          logic(MarketCapLow, filters) {
            if (filters[0] && filters[1]) {
              return MarketCapLow < filters[0] || MarketCapLow > filters[1];
            } else if (filters[0]) {
              return MarketCapLow < filters[0];
            } else if (filters[1]) {
              return MarketCapLow > filters[1];
            }
            return false;
          },
          display: (filterList, onChange, index, column) => {
            const handleChange = debounce((_, newValue) => {
              filterList[index] = newValue;
              onChange(filterList[index], index, column);
            }, 100);
            const minValue =
              filterList[index][0] ?? columnRange["MarketCapLow"]["min"];
            const maxValue =
              filterList[index][1] ?? columnRange["MarketCapLow"]["max"];

            return (
              <div>
                <div className={styles.rangeLabel}>Market Cap Low</div>
                <div className={styles.rangeValue}>
                    <div>Min : {minValue && minValue.toLocaleString("en")}</div>
                  <div>Max :{" "}
                  {maxValue && maxValue.toLocaleString("en")}</div> 
                </div>
                <Slider
                  value={[minValue, maxValue]}
                  onChange={handleChange}
                  valueLabelDisplay="off"
                  min={columnRange["MarketCapLow"]["min"]}
                  max={columnRange["MarketCapLow"]["max"]}
                  step={10000000}
                  color="secondary"
                />
              </div>
            );
          },
        },
      },
    },
    {
      name: "MarketCapDrop",
      label: "Market Cap Drop",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => (
          <div className="text-center text-sm">
            {value ? value.toLocaleString("en") : "NA"}
          </div>
        ),
      },
    },
    {
      name: "TotalSettlementAmount",
      label: "Total Settlement Amount",
      options: {
        filter: true,
        sort: true,
        customBodyRender: (value) => (
          <div className="text-center text-sm">
            {value ? value.toLocaleString("en") : "NA"}
          </div>
        ),
      },
    },
    {
        name: "CashAmount",
        label: "Cash Amount",
        options: {
          filter: true,
          sort: true,
          customBodyRender: (value) => (
            <div className="text-center text-sm">
              {value ? value.toLocaleString("en") : "NA"}
            </div>
          ),
        },
      },
      {
        name: "CashAmount",
        label: "Cash Amount",
        options: {
          filter: true,
          sort: true,
          customBodyRender: (value) => (
            <div className="text-center text-sm">
              {value ? value.toLocaleString("en") : "NA"}
            </div>
          ),
        },
      },
      {
        name: "FreeFloat",
        label: "Free Float (%)",
        options: {
          filter: true,
          sort: true,
          customBodyRender: (value) => (
            <div className="text-center text-sm">
              {value ? value.toLocaleString("en") : "NA"} %
            </div>
          ),
        },
      },
      {
        name: "PriorYearRevenue",
        label: "Prior Year Revenue($)",
        options: {
          filter: true,
          sort: true,
          customBodyRender: (value) => (
            <div className="text-center text-sm">
              {value ? value.toLocaleString("en") : "NA"} 
            </div>
          ),
        },
      },
      {
        name: "Ticker",
        label: "Ticker",
        options: {
          filter: true,
          sort: true,
          customBodyRender: (value) => (
            <div className="text-center text-sm">
              {value ? value : "NA"} 
            </div>
          ),
        },
      },
      {
        name: "FederalCourt",
        label: "Federal Court",
        options: {
          filter: true,
          sort: true,
          customBodyRender: (value) => (
            <div className="text-center text-sm">
              {value ? value : "NA"} 
            </div>
          ),
        },
      },
      {
        name: "FederalJudge",
        label: "Federal Judge",
        options: {
          filter: true,
          sort: true,
          customBodyRender: (value) => (
            <div className="text-center text-sm">
              {value ? value : "NA"} 
            </div>
          ),
        },
      },
      {
        name: "PriorQuarterDate",
        label: "Post Approval",
        options: {
          filter: true,
          sort: true,
          customBodyRender: (value) => (
            <div className="text-center text-sm">
              {value ? value : "NA"} 
            </div>
          ),
        },
      },
  ];

  console.log("tableData>>", tableData);
  console.log("columnRange>>", columnRange);

  const customTheme = createTheme({
    palette: {
      mode: "dark",
    },
  });


  console.log("test11");

  return (
    <div className={styles.mainContainer}>
      <div className={styles.tableContainer}>
        <div>
          {loading ? (
            // Display a loading indicator while data is loading
            <CircularProgress
              size={80}
              style={{ margin: "auto", display: "block" }}
            />
          ) : (
            // Render the table when data is loaded
            <ThemeProvider theme={customTheme}>
              <MUIDataTable
                data={tableData}
                columns={columns}
                options={{
                  selectableRows: false,
                }}
              />
            </ThemeProvider>
          )}
        </div>
      </div>
    </div>
  );
};

const useStyles = makeStyles((theme) => {
  return {
    drawer: {
      flexShrink: 0,
    },
    drawerContainer: {
      overflow: "auto",
      width: "300px",
    },
    drawerPaper: {
      marginTop: "95px",
      visibility: "visible !important",
      overflowY: "visible",
      height: "calc(100% - 95px)",
    },
    drawerHandle: {
      marginRight: "-48px",
      position: "absolute",
      borderRadius: "0% 50% 50% 0%",
      borderStyle: "solid",
      borderWidth: "1px",
      borderLeft: "none",
      borderColor: "rgba(0, 0, 0, 0.12)",
      top: "15px",
      right: "-2px",
      width: "48px",
    },
    handleIcon: {
      height: "50px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    handleIconRoot: {
      borderRadius: "0% 50% 50% 0%",
    },
    mainContainer: {
      [theme.breakpoints.down("md")]: {
        width: "100%",
      },
      [theme.breakpoints.down("lg")]: {
        width: "900px",
      },
      [theme.breakpoints.up("lg")]: {
        width: "1200px",
      },
      [theme.breakpoints.up("xl")]: {
        width: "1700px",
      },
      marginTop: "95px",
      padding: "24px 0px",
    },
    filterContainer: {
      margin: "0px 0px 24px 0px",
    },
    tableContainer: {
      backgroundColor: "#424242",
    },
    dataGrid: {
      backgroundColor: "#fff",
    },
    rangeLabel: {
      fontSize: 12,
      fontFamily: "Roboto, Helvetica, Arial, sans-serif !important",
      color: "rgba(255, 255, 255, 0.7)",
    },
    rangeValue: {
      fontSize: 12,
      fontFamily: "Roboto, Helvetica, Arial, sans-serif !important",
      color: "rgba(255, 255, 255, 0.7)",
      margin: "12px 0 12px 0",
      width : '100%',
      display: 'flex',
      flexDirection:'row',
      justifyContent:'space-between'
    },
  };
});

export default Dashboard;
