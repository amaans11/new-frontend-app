import { useAuth0 } from "@auth0/auth0-react";
import {
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  Paper,
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import FilterListIcon from "@material-ui/icons/FilterList";
import KeyboardArrowLeftIcon from "@material-ui/icons/KeyboardArrowLeft";
import MenuIcon from "@material-ui/icons/Menu";
import * as _ from "lodash";
import moment from "moment";
import { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  addSavedFilter,
  deleteSavedFilter,
  getData,
  getSavedFilters,
} from "../services/requests";
import DataTable from "./DataTable";
import DataTableFilters from "./DataTableFilters";

const colMap = {
  CLASS_END_DATE_DAY_AFTER: {
    name: "classenddatedayafter",
    displayName: "Class End Date Day After",
  },
  FREE_FLOAT: { name: "freefloat", displayName: "Free Float" },
  PRIOR_QUARTER_DATE: {
    name: "priorquarterdate",
    displayName: "Prior Quarter Date",
  },
  TOTAL_NON_CASH_AMOUNT: {
    name: "totalnoncashamount",
    displayName: "Total Non Cash Amount",
  },
  SIC_CODE: { name: "siccode", displayName: "SIC Code" },
  FEDERAL_CASE_NUMBER: {
    name: "federalcasenumber",
    displayName: "Federal Case Number",
  },
  FEDERAL_JUDGE: { name: "federaljudge", displayName: "Federal Judge" },
  TOTAL_CASH: { name: "totalcash", displayName: "Total Cash on Balance Sheet" },
  IPO: { name: "ipo_yn", displayName: "IPO" },
  GAAP: { name: "gaap_yn", displayName: "GAAP" },
  "10B_5": { name: "10b_5_yn", displayName: "10B 5" },
  INSTITUTIONAL_OWNERSHIP_PERCENT_PRIOR_QTR: {
    name: "institutionalownershippriorquarter",
    displayName: "Institutional Ownership Prior Quarter",
  },
  CASH_SHARE: { name: "cashshare", displayName: "Cash Share" },
  FREE_FLOAT_PCT: { name: "floatpct", displayName: "Free Float (%)" },
  TICKER: { name: "ticker", displayName: "Ticker" },
  BANKRUPTCY_CASE: { name: "bankruptcycaseyn", displayName: "Bankruptcy Case" },
  OP: { name: "po_yn", displayName: "PO" },
  FEDERAL_COURT: { name: "federalcourt", displayName: "Federal Court" },
  MARKET_CAP_LOW: { name: "marketcaplow", displayName: "Market Cap Low" },
  FINAL_SETTELMENT_DATE: {
    name: "finalsettlementdate",
    displayName: "Final Settlement Date",
  },
  CASE_ID: { name: "caseid", displayName: "Case ID" },
  LADDERING: { name: "ladderingyn", displayName: "Laddering" },
  SHORT: { name: "shortpct", displayName: "Short (%)" },
  IT: { name: "it_yn", displayName: "IT" },
  RESTATED_FINANCIALS: {
    name: "restatedfinancialsyn",
    displayName: "Restated Financials",
  },
  SEC_ACTION: { name: "secactionyn", displayName: "SEC Action" },
  WHY_SUED: { name: "whysuedcategory", displayName: "Why Sued" },
  INSIDER_OWNERSHIP: {
    name: "insiderownership",
    displayName: "Insider Ownership",
  },
  CASE_STATUS: { name: "casestatus", displayName: "Case Status" },
  WHY_SUED_ALLEGATIONS: {
    name: "whysuedallegations",
    displayName: "Why Sued Allegations",
  },
  CURRENT_RATIO: { name: "currentratio", displayName: "Current Ratio" },
  CASE_NAME: { name: "casename", displayName: "Case Name" },
  FEDERAL_FILING_DATE: {
    name: "federalfilingdate",
    displayName: "Federal Filing Date",
  },
  CLASS_START_DATE: { name: "classstartdate", displayName: "Class Start Date" },
  CASH_SETTLEMENT_AMOUND: {
    name: "cashsettlementamount",
    displayName: "Cash Settlement Amount",
  },
  CASH_SETTLEMENT_AMOUND: {
    name: "tentativesettlementamount",
    displayName: "Tentative Amount",
  },
  TRANSACTIONAL: { name: "transactionalyn", displayName: "Transactional" },
  CLASS_END_DATE: { name: "classenddate", displayName: "Class End Date" },
  COMPANY_NAME: { name: "companyname", displayName: "Company Name" },
  MARKET_CAP_HIGH: { name: "marketcaphigh", displayName: "Market Cap High" },
  MARKET_CAP_DROP: { name: "marketcapdrop", displayName: "Drop" },
  TOTAL_SETTLEMENT_AMOUNT: {
    name: "totalsettlementamount",
    displayName: "Total Settlement Amount ($)",
  },
  INSTITUTIONAL_OWNERSHIP: {
    name: "institutionalownership",
    displayName: "Institutional Ownership",
  },
  INSTITUTIONAL_OWNERSHIP_PCT: {
    name: "institutionalownershippct",
    displayName: "Institutional Ownership (%)",
  },
  SEC_11: { name: "sec_11_yn", displayName: "SEC 11" },
  MARKET_CAP: { name: "market_cap", displayName: "Market Cap" },
  PRIOR_QUARTER_REVENUE: {
    name: "priorquarterrevenue",
    displayName: "Prior Quarter Revenue",
  },
  PRIOR_YEAR_REVENUE: {
    name: "prioryearrevenue",
    displayName: "Prior Year Revenue",
  },

  STATE_FILING_DATE: {
    name: "statefilingdate",
    displayName: "State Filing Date",
  },
  FREE_FLOAT_MARKET_CAP: {
    name: "freefloatmarketcap",
    displayName: "Free Float Market Cap",
  },
  INSIDER_OWNERSHIP_PERCENT_FILING_DATE: {
    name: "insiderownershippercentfilingdate",
    displayName: "Insider Ownership At Filing Date (%)",
  },
  INSTITUTIONAL_OWNERSHIP_PERCENT_QTR_END: {
    name: "institutionalownershipqtrend",
    displayName: "Institutional Ownership At Qtr End (%)",
  },
  TOTAL_AMOUNT: { name: "totalamount", displayName: "Total Amount ($)" },
  COURT_STATURE: { name: "courtstature", displayName: "Court Stature" },
  FEDERAL_JUDGE: { name: "federaljudge", displayName: "Federal Judge" },
  SUB_CATEGORY: { name: "sub-category", displayName: "Sub Category" },
  CASH_AMOUNT: { name: "cashamount", displayName: "Total Settlement Amount" },
};

const favoriteCols = [
  "federalfilingdate",
  "casename",
  "ticker",
  "siccode",
  "whysuedcategory",
  "whysuedallegations",
  "casestatus",
  "marketcaphigh",
  "marketcaplow",
  "marketcapdrop",
  "cashamount",
  "floatpct",
  "freefloatmarketcap",
  "priorquarterrevenue",
  "prioryearrevenue",
  "short",
  "insiderownershippercentfilingdate",
  "institutionalownershipqtrend",
  "totalamount",
  "caseid",
  "courtstature",
  "federalcourt",
  "federaljudge",
  "po_yn",
  "ipo_yn",
  "ladderingyn",
  "transactionalyn",
  "it_yn",
  "gaap_yn",
  "restatedfinancialsyn",
  "10b_5_yn",
  "sec_11_yn",
  "secactionyn",
  "classenddatedayafter",
  "freefloat",
  "priorquarterdate",
  "totalnoncashamount",
  "federalcasenumber",
  "totalcash",
  "institutionalownershippriorquarter",
  "cashshare",
  "bankruptcycaseyn",
  "finalsettlementdate",
  "shortpct",
  "insiderownership",
  "currentratio",
  "classstartdate",
  "cashsettlementamount",
  "tentativesettlementamount",
  "classenddate",
  "companyname",
  "totalsettlementamount",
  "institutionalownership",
  "institutionalownershippct",
  "marketcap",
  "allegations",
];

const DataTableComponent = (props) => {
  const styles = useStyles();

  const { getAccessTokenSilently } = useAuth0();
  const [rawTableData, setRawTableData] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [currentTableSort, setCurrentTableSort] = useState(null);
  const [tableSlice, setTableSlice] = useState(null);
  const [tableConfig, setTableConfig] = useState(null);
  const [tableMeta, setTableMeta] = useState(null);
  const [filters, setFilters] = useState([]);
  const [drawerToggle, setDrawerToggle] = useState(false);
  const [savedFilters, setSavedFilters] = useState([]);

  useEffect(async () => {
    const token = await getAccessTokenSilently();
    const data = await getData(token);
    getSavedFiltersHelper(token);
    if (data?.rows && data?.meta) {
      convertRowProps(data);
      const tableData = createTableData(data.rows);
      const tableConfig = createTableConfig(data.rows, data.meta);
      setRawTableData(tableData);
      setTableData(tableData);
      setTableConfig(tableConfig);
      setTableMeta(data.meta);
    }
  }, []);

  useEffect(() => {
    processFilters();
  }, [JSON.stringify(filters)]);

  const checkForCustomColumnProps = (dataProperty) => {
    const config = {};
    const propLower = dataProperty.toLowerCase();
    for (const value of Object.values(colMap)) {
      if (value.name === propLower) config.displayName = value.displayName;
    }
    if (
      [
        "casename",
        "insiderownershippercentfilingdate",
        "institutionalownershipqtrend",
        "institutionalownershippriorquarter",
        "totalsettlementamount",
        "priorquarterrevenue",
        "prioryearrevenue",
        "tentativesettlementamount",
      ].includes(propLower)
    ) {
      config.width = 300;
    }
    if (
      [
        "insiderownershippercentfilingdate",
        "institutionalownershipqtrend",
        "floatpct",
        "short",
        "shortpct",
        "insiderownership",
        "institutionalownership",
        "institutionalownershippct",
      ].includes(propLower)
    ) {
      config.dataType = "percent";
    }
    if (
      ["ticker", "whysuedcategory", "casestatus", "courtstature"].includes(
        propLower
      )
    ) {
      config.alignmentRow = "center";
    }
    if (["currentratio"].includes(propLower)) {
      config.dataType = "number";
    }
    return config;
  };

  const convertRowProps = (data) => {
    const boolProps = data.meta.filter((m) => m.type.toLowerCase() === "tiny");
    if (boolProps.length) {
      for (let row of data.rows) {
        for (let boolProp of boolProps) {
          row[boolProp.name] = row[boolProp.name] === 0 ? "No" : "Yes";
        }
      }
    }
  };

  const getColumnConfig = (type) => {
    const config = { dataType: "string" };
    switch (type.toLowerCase()) {
      case "var_string":
      case "blob":
        config.dataType = "string";
        break;
      case "newdecimal":
        config.dataType = "currency";
        break;
      case "tiny":
        config.dataType = "string";
        config.alignmentRow = "center";
        break;
      case "long":
      case "float":
      case "double":
        config.dataType = "number";
        break;
      case "date":
        config.dataType = "date";
        config.alignmentRow = "center";
    }
    return config;
  };

  const getColumnFromMeta = (meta) => {
    const config = getColumnConfig(meta.type);
    const customConfig = checkForCustomColumnProps(meta.name);
    const hidden = !favoriteCols.find((col) => col === meta.name.toLowerCase());
    let column = {
      id: uuidv4(),
      rawType: meta.type,
      displayName: meta.name,
      dataProperty: meta.name,
      sort: true,
      sortDirection: null,
      dataType: null,
      alignmentHeader: "center",
      alignmentRow: null,
      width: null,
      flex: null,
      options: [],
      hidden: hidden,
      headerBorderWidth: 1,
      cellBorderWidth: 1,
    };
    column = Object.assign({}, column, config, customConfig);
    return column;
  };

  const createTableConfig = (rows, meta) => {
    const tableConfig = {
      numRows: rows.length,
      rowsPerPage: 50,
      showHeader: true,
      actions: [],
      columns: [],
      editable: {},
      // headerCellStyles: [{ dataProperty: ['*'], style: { 'fontSize': '1.6rem', 'fontWeight': 'bold', 'color': 'rgb(109 107 107)' }}],
      headerCellStyles: [
        {
          dataProperty: ["*"],
          style: { fontSize: "1rem", fontWeight: "bold", color: "white" , minWidth : 100 , maxWidth:100 },
        },
      ],
      headerRowStyles: {},
    };
    for (let fav of favoriteCols) {
      const columnMeta = meta.find((m) => m.name.toLowerCase() === fav);
      if (columnMeta) {
        tableConfig.columns.push(getColumnFromMeta(columnMeta));
      }
    }
    for (let columnMeta of meta) {
      if (!favoriteCols.includes(columnMeta.name.toLowerCase())) {
        tableConfig.columns.push(getColumnFromMeta(columnMeta));
      }
    }
    return tableConfig;
  };

  const createTableData = (data) => {
    const tableData = [];
    for (let rowData of data) {
      tableData.push({
        data: rowData,
        actions: [],
        options: null,
        rowStyles: {},
        // cellStyles: [{ dataProperty: ['*'], style: { 'fontSize': '1.6rem', 'borderRight': '1px solid #F1F1F1', 'borderBottom': '1px solid #F1F1F1' }}],
        cellStyles: [
          {
            dataProperty: ["*"],
            style: {
              fontSize: "1rem",
              borderRight: "1px solid #696969",
              borderBottom: "1px solid #696969",
              // minWidth : 129 ,
              // maxWidth:129,
              wordWrap: "break-all",
              height: 70,
              display:'flex',
              flexDirection : 'row',
              justifyContent:'center'
            },
          },
        ],
        id: uuidv4(),
      });
    }
    return tableData;
  };

  const tableSliceHandler = (tableEvent) => {
    const numTableRows = tableData.length;
    var lowerRowIdx = Math.max(tableEvent.data.lowerRowIdx, 0);
    // const upperRowIdx = Math.min(numTableRows, tableEvent.data.upperRowIdx)
    const upperRowIdx = Math.min(
      numTableRows,
      tableEvent.data.lowerRowIdx + tableConfig.rowsPerPage
    );
    if (lowerRowIdx > upperRowIdx) {
      lowerRowIdx = Math.max(upperRowIdx - tableEvent.size, 0);
    }
    const tableRows = tableData.slice(lowerRowIdx, upperRowIdx);
    const slice = {
      tableRows,
      lowerRowIdx: lowerRowIdx,
      upperRowIdx: upperRowIdx,
    };
    setTableSlice(slice);
  };

  const tableSortAscHelper = (newTableData, column) => {
    switch (column.dataType) {
      case "currency":
      case "percent":
      case "number":
        newTableData.sort((a, b) => {
          let valA = a.data[column.dataProperty];
          let valB = b.data[column.dataProperty];
          if (valA == undefined) {
            return 1;
          }
          if (valB == undefined) {
            return -1;
          }
          return valA - valB;
        });
        break;
      case "string":
        newTableData.sort((a, b) => {
          let valA = a.data[column.dataProperty];
          let valB = b.data[column.dataProperty];
          if (valA == undefined || valA == "") {
            return 1;
          }
          if (valB == undefined || valB == "") {
            return -1;
          }
          return valA.localeCompare(valB);
        });
        break;
      case "date":
        newTableData.sort((a, b) => {
          let valA = a.data[column.dataProperty];
          let valB = b.data[column.dataProperty];
          let mntA = moment(valA);
          let mntB = moment(valB);
          if (mntA.inspect().includes("invalid") || valA == undefined) {
            return 1;
          }
          if (mntB.inspect().includes("invalid") || valB == undefined) {
            return -1;
          }
          const rtn = moment(valB).isAfter(valA) ? -1 : 1;
          return rtn;
        });
        break;
      default:
        break;
    }
  };

  const tableSortDescHelper = (newTableData, column) => {
    switch (column.dataType) {
      case "currency":
      case "percent":
      case "number":
        newTableData.sort((a, b) => {
          let valA = a.data[column.dataProperty];
          let valB = b.data[column.dataProperty];
          if (valA == undefined) {
            return 1;
          }
          if (valB == undefined) {
            return -1;
          }
          return valB - valA;
        });
        break;
      case "string":
        newTableData.sort((a, b) => {
          let valA = a.data[column.dataProperty];
          let valB = b.data[column.dataProperty];
          if (valA == undefined || valA == "") {
            return 1;
          }
          if (valB == undefined || valB == "") {
            return -1;
          }
          return valB.localeCompare(valA);
        });
        break;
      case "date":
        newTableData.sort((a, b) => {
          let valA = a.data[column.dataProperty];
          let valB = b.data[column.dataProperty];
          let mntA = moment(valA);
          let mntB = moment(valB);
          if (mntA.inspect().includes("invalid") || valA == undefined) {
            return 1;
          }
          if (mntB.inspect().includes("invalid") || valB == undefined) {
            return -1;
          }
          const rtn = moment(valA).isAfter(valB) ? -1 : 1;
          return rtn;
        });
        break;
      default:
        break;
    }
  };

  const tableSortHandler = (tableEvent) => {
    if (!tableConfig) return;
    const column = tableConfig.columns.find(
      (col) => col.dataProperty === tableEvent.data.dataProperty
    );
    if (!column) return;
    const newTableData = _.cloneDeep(tableData);
    const newTableConfig = _.cloneDeep(tableConfig);
    if (
      !tableEvent.data.sortDirection ||
      tableEvent.data.sortDirection === "desc"
    ) {
      tableSortAscHelper(newTableData, column);
      newTableConfig.columns.forEach((col) => {
        col.sortDirection =
          col.dataProperty === tableEvent.data.dataProperty ? "asc" : null;
      });
    } else {
      tableSortDescHelper(newTableData, column);
      newTableConfig.columns.forEach((col) => {
        col.sortDirection =
          col.dataProperty === tableEvent.data.dataProperty ? "desc" : null;
      });
    }
    setCurrentTableSort(tableEvent.data);
    setTableData(newTableData);
    setTableConfig(newTableConfig);
  };

  const tableEventHandler = (tableEvent) => {
    switch (tableEvent.type) {
      case "dataSlice":
        tableSliceHandler(tableEvent);
        break;
      case "columnSort":
        tableSortHandler(tableEvent);
      default:
        break;
    }
  };

  const processFilters = () => {
    if (rawTableData == null || tableConfig == null) {
      return;
    }

    for (let filter of filters) {
      // if commited range and range value are not equal this means we are in an intermediate state so no need to update filters
      if (
        filter.type === "range" &&
        filter.commitedRange &&
        filter.commitedRange.toString() !==
          getRawFromFilterMarks(filter, filter.rangeValue).toString()
      ) {
        return;
      }
    }

    const tableDataClone = _.cloneDeep(rawTableData);
    const tableConfigClone = _.cloneDeep(tableConfig);

    if (!filters.length) {
      // Reset to raw table data when all filters have been removed
      tableConfigClone.numRows = tableDataClone.length;
      setTableConfig(tableConfigClone);
      setTableData(tableDataClone);
      return;
    }

    const filteredTableData = [];
    var atLeastOneChange = false;
    for (let row of tableDataClone) {
      let passFilter = true;
      for (let filter of filters) {
        // apply each filter using AND logic
        const value = row.data[filter.column.dataProperty];
        if (filter.column.dataType === "date") {
          if (filter.type === "range") {
            const date = moment(value);
            let maxValue;
            let minValue;
            if (
              filter.commitedRange[0].inspect().includes("invalid") ||
              filter.commitedRange[1].isAfter(filter.commitedRange[0])
            ) {
              maxValue = filter.commitedRange[1];
              minValue = filter.commitedRange[0];
            } else {
              maxValue = filter.commitedRange[0];
              minValue = filter.commitedRange[1];
            }
            if (date.inspect().includes("invalid")) {
              if (minValue.inspect().includes("invalid")) {
                // inside
                passFilter = filter.showSelected ? true : false;
              } else {
                // outside
                passFilter = filter.showSelected ? false : true;
              }
            } else if (date.isBefore(minValue) || date.isAfter(maxValue)) {
              // outside
              passFilter = filter.showSelected ? false : true;
            } else {
              // inside
              passFilter = filter.showSelected ? true : false;
            }
          } else if (filter.type === "value") {
            // an empty value filter will be ignored
            if (filter.selected.length) {
              if (filter.selected.includes(value)) {
                // inside
                passFilter = filter.showSelected ? true : false;
              } else {
                // outside
                passFilter = filter.showSelected ? false : true;
              }
            }
          }
        } else if (
          ["currency", "number", "percent"].includes(filter.column.dataType)
        ) {
          if (filter.type === "range") {
            const minValue = Math.min(...filter.commitedRange);
            const maxValue = Math.max(...filter.commitedRange);
            if (value < minValue || value > maxValue) {
              // outside
              passFilter = filter.showSelected ? false : true;
            } else {
              // inside
              passFilter = filter.showSelected ? true : false;
            }
          } else if (filter.type === "value") {
            // an empty value filter will be ignored
            if (filter.selected.length) {
              if (filter.selected.includes(value)) {
                // inside
                passFilter = filter.showSelected ? true : false;
              } else {
                // outside
                passFilter = filter.showSelected ? false : true;
              }
            }
          }
        } else if (filter.column.dataType === "string") {
          // an empty string filter will be ignored
          if (filter.selected.length) {
            if (filter.selected.includes(value)) {
              // inside
              passFilter = filter.showSelected ? true : false;
            } else {
              // outside
              passFilter = filter.showSelected ? false : true;
            }
          }
        }
        if (!passFilter) {
          break;
        }
      }
      if (passFilter) {
        // all filters have been passed, add row to output
        filteredTableData.push(row);
      } else {
        atLeastOneChange = true;
      }
    }

    if (currentTableSort) {
      const column = tableConfigClone.columns.find(
        (col) => col.dataProperty === currentTableSort.dataProperty
      );
      if (column) {
        if (
          !currentTableSort.sortDirection ||
          currentTableSort.sortDirection === "desc"
        ) {
          tableSortAscHelper(filteredTableData, column);
          tableConfigClone.columns.forEach((col) => {
            col.sortDirection =
              col.dataProperty === currentTableSort.dataProperty ? "asc" : null;
          });
        } else {
          tableSortDescHelper(filteredTableData, column);
          tableConfigClone.columns.forEach((col) => {
            col.sortDirection =
              col.dataProperty === currentTableSort.dataProperty
                ? "desc"
                : null;
          });
        }
      }
    }
    tableConfigClone.numRows = filteredTableData.length;
    setTableData(filteredTableData);
    setTableConfig(tableConfigClone);
    if (atLeastOneChange) {
      setTableSlice((state) => ({
        ...state,
        lowerRowIdx: null,
        upperRowIdx: null,
      }));
    }
  };

  const getRawFromFilterMarks = (filter, rangeValue) => {
    console.log("filter>>",filter)
    
    const valA = rangeValue[0];
    const valB = rangeValue[1];
    return [valA, valB];
  };

  const getFilterMarksFromRaw = (filter) => {
    const getVal = (val) => {
      if (filter.column.dataType === "date") {
        return val.format("YYYY-MM-DD");
      }
      return val;
    };
    const valA = filter.marks.find(
      (mark) => getVal(mark.rawValue) === getVal(filter.commitedRange[0])
    ).value;
    const valB = filter.marks.find(
      (mark) => getVal(mark.rawValue) === getVal(filter.commitedRange[1])
    ).value;
    return [valA, valB];
  };

  const handleFilterRangeCommitted = (filterId, rangeValue) => {
    const filterIndex = filters.findIndex((f) => f.id === filterId);
    if (filterIndex === -1) return;
    const updatedFilter = _.cloneDeep(filters[filterIndex]);
    updatedFilter.rangeValue = rangeValue;
    updatedFilter.commitedRange = getRawFromFilterMarks(
      updatedFilter,
      rangeValue
    );
    setFilters((state) => {
      const newState = _.cloneDeep(state);
      newState.splice(filterIndex, 1, updatedFilter);
      return newState;
    });
  };

  const handleFilterRangeChange = (filterId, rangeValue) => {
    const filterIndex = filters.findIndex((f) => f.id === filterId);
    if (filterIndex === -1) return;
    const updatedFilter = _.cloneDeep(filters[filterIndex]);
    updatedFilter.rangeValue = rangeValue;
    setFilters((state) => {
      const newState = _.cloneDeep(state);
      newState.splice(filterIndex, 1, updatedFilter);
      return newState;
    });
  };

  const handleFilterValueChange = (filterId, values) => {
    const filterIndex = filters.findIndex((f) => f.id === filterId);
    if (filterIndex === -1) return;
    const updatedFilter = _.cloneDeep(filters[filterIndex]);
    updatedFilter.selected = values;
    setFilters((state) => {
      const newState = _.cloneDeep(state);
      newState.splice(filterIndex, 1, updatedFilter);
      return newState;
    });
  };

  const handleFilterHideSelectChange = (filterId) => {
    const filterIndex = filters.findIndex((f) => f.id === filterId);
    if (filterIndex === -1) return;
    const updatedFilter = _.cloneDeep(filters[filterIndex]);
    updatedFilter.showSelected = !updatedFilter.showSelected;
    setFilters((state) => {
      const newState = _.cloneDeep(state);
      newState.splice(filterIndex, 1, updatedFilter);
      return newState;
    });
  };

  const handleFilterRangeLimitClicked = (filterId, type) => {
    const filterIndex = filters.findIndex((f) => f.id === filterId);
    if (filterIndex === -1) return;
    const updatedFilter = _.cloneDeep(filters[filterIndex]);
    if (type === "max") {
      updatedFilter.maxOpen = !updatedFilter.maxOpen;
    } else {
      updatedFilter.minOpen = !updatedFilter.minOpen;
    }
    setFilters((state) => {
      const newState = _.cloneDeep(state);
      newState.splice(filterIndex, 1, updatedFilter);
      return newState;
    });
  };

  const generateRangeFilterMarks = (dataType, columnData) => {
    let marks = [];
    if (dataType === "percent") {
      console.log("1")
      columnData = Array.from(new Set(columnData));
      const max = Math.max(100, ...columnData);
      let val = 0;
      while (val <= max) {
        marks.push({
          value: val / 0.5,
          label: null,
          rawValue: val,
        });
        val += 0.5;
      }
      if (max % 0.5 !== 0) {
        marks.push({
          value: val / 0.5,
          label: null,
          rawValue: val,
        });
      }
    } else if (dataType === "currency") {
      const max = Math.max(...columnData);
      if (max > 100e6) {
        // Greater than 100M
        for (let i = 0; i < 4; i++) {
          marks.push({ value: i, label: null, rawValue: 10000000 * i });
        }
        for (let i = 1; i < 5; i++) {
          marks.push({ value: i + 3, label: null, rawValue: 10000000 * i });
        }
        for (let i = 1; i <= 5; i++) {
          marks.push({ value: i + 7, label: null, rawValue: 10000000 * i });
        }
        for (let i = 1; i <= Math.ceil(max / 100e6); i++) {
          marks.push({ value: i + 12, label: null, rawValue: 10000000 * i });
        }
      } else if (max > 1e6) {
        // Greater than 1M (max 104 ticks)
        for (let i = 0; i < 4; i++) {
          marks.push({ value: i, label: null, rawValue: 250e3 * i });
        }
        for (let i = 1; i <= Math.ceil(max / 1e6); i++) {
          marks.push({ value: i + 3, label: null, rawValue: 1e6 * i });
        }
      } else {
        // Less than 1M (max 101 ticks)
        for (let i = 0; i <= Math.ceil(max / 10e3); i++) {
          marks.push({ value: i, label: null, rawValue: 10e3 * i });
        }
      }
    } else {
      console.log("3")
      marks = Array.from(new Set(columnData)).map((value, idx) => {
        return { value: idx, label: null, rawValue: value };
      });
    }
    console.log("marks>",marks)
    return marks;
  };

  const filterAddedHelper = (column, type, initialValue, showSelected) => {
    let filter = null;
    showSelected = showSelected == undefined ? true : showSelected;
    if (["currency", "number", "percent"].includes(column.dataType)) {
      if (type === "range") {
        filter = {
          column: column,
          type: "range",
          max: null,
          min: null,
          id: uuidv4(),
          rangeValue: null,
          commitedRange: null,
          marks: [],
          showSelected,
          minOpen: false,
          maxOpen: false,
        };
        let columnData = [];
        rawTableData.forEach((row) => {
          const data = row.data[column.dataProperty];
          if (!(data == null)) columnData.push(data);
        });
        columnData.sort((a, b) => a - b);
        filter.marks = generateRangeFilterMarks(column.dataType, columnData);
        filter.max = columnData[columnData.length - 1];
        filter.min = 0;
        filter.commitedRange = initialValue || [
          columnData[0],
          columnData[columnData.length - 1],
        ];
        filter.rangeValue = initialValue
          ? getFilterMarksFromRaw(filter)
          : [filter.min, filter.max];
      } else if (type === "value") {
        filter = {
          column: column,
          type: "value",
          id: uuidv4(),
          options: null,
          selected: [],
          showSelected,
        };
        const columnData = [];
        rawTableData.forEach((row) => {
          const data = row.data[column.dataProperty];
          if (!(data == null)) columnData.push(data);
        });
        const optionsSet = new Set(columnData);
        filter.options = Array.from(optionsSet);
        filter.selected = initialValue || [];
      }
    } else if (column.dataType === "string") {
      filter = {
        column: column,
        type: "value",
        id: uuidv4(),
        options: null,
        selected: [],
        showSelected,
      };
      const columnData = [];
      rawTableData.forEach((row) => {
        const data = row.data[column.dataProperty];
        if (!(data == null)) columnData.push(data);
      });
      const optionsSet = new Set(columnData);
      filter.options = Array.from(optionsSet);
      filter.selected = initialValue || [];
    } else if (column.dataType === "date") {
      if (type === "range") {
        filter = {
          column: column,
          type: "range",
          max: null,
          min: null,
          id: uuidv4(),
          rangeValue: null,
          commitedRange: null,
          marks: null,
          showSelected,
          minOpen: false,
          maxOpen: false,
        };
        const columnData = Array.from(
          new Set(rawTableData.map((row) => row.data[column.dataProperty]))
        );
        const columnDataMnt = columnData
          .map((row) => moment(row))
          .sort((valA, valB) => {
            if (valA == undefined) {
              return -1;
            }
            if (valB == undefined) {
              return 1;
            }
            let mntA = moment(valA);
            let mntB = moment(valB);
            if (mntA.inspect().includes("invalid")) {
              return -1;
            }
            if (mntB.inspect().includes("invalid")) {
              return 1;
            }
            const rtn = moment(valB).isAfter(valA) ? -1 : 1;
            return rtn;
          });
        filter.marks = columnDataMnt.map((value, idx) => {
          return { value: idx, label: null, rawValue: value };
        });
        filter.max = filter.marks.length - 1;
        filter.min = 0;
        filter.commitedRange = initialValue || [
          columnDataMnt[0],
          columnDataMnt[columnDataMnt.length - 1],
        ];
        filter.rangeValue = initialValue
          ? getFilterMarksFromRaw(filter)
          : [filter.min, filter.max];
      } else if (type === "value") {
        filter = {
          column: column,
          type: "value",
          id: uuidv4(),
          options: null,
          selected: [],
          showSelected,
        };
        const columnData = rawTableData.map(
          (row) => row.data[column.dataProperty]
        );
        const optionsSet = new Set(columnData);
        filter.options = Array.from(optionsSet);
        filter.selected = initialValue || [];
      }
    }
    return filter;
  };

  const handleFilterAdded = (column, type, initialValue) => {
    const filter = filterAddedHelper(column, type, initialValue);
    setFilters((state) => {
      const newState = _.cloneDeep(state);
      return [...newState, filter];
    });
  };

  const saveFiltersHelper = async (displayName) => {
    if (!filters.length) return;
    const filterDefs = filters.map((filter) => {
      const { dataProperty, rawType } = filter.column;
      const filterDef = {
        column: { dataProperty, rawType },
        id: filter.id,
        type: filter.type,
        showSelected: filter.showSelected,
      };
      if (filter.type === "range") {
        filterDef.value = filter.commitedRange;
      } else if (filter.type === "value") {
        filterDef.value = filter.selected;
      }
      return filterDef;
    });
    const token = await getAccessTokenSilently();
    await addSavedFilter(token, filterDefs, displayName);
    getSavedFiltersHelper(token);
  };

  const getSavedFiltersHelper = async (token) => {
    token = token ? token : await getAccessTokenSilently();
    const filters = await getSavedFilters(token);
    if (filters?.rows) {
      setSavedFilters(filters.rows);
    }
  };

  const deleteSavedFilterHelper = async (filtersData) => {
    if (!filtersData?.uuid) return;
    const token = await getAccessTokenSilently();
    await deleteSavedFilter(token, filtersData.uuid);
    getSavedFiltersHelper(token);
  };

  const handleColumnToggle = (columnId) => {
    const tableConfigClone = _.cloneDeep(tableConfig);
    const column = tableConfigClone.columns.find((col) => col.id === columnId);
    if (column) {
      column.hidden = !column.hidden;
      setTableConfig(tableConfigClone);
    }
  };

  const handleColumnToggleBatch = (columnIds) => {
    if (!columnIds) return;
    const tableConfigClone = _.cloneDeep(tableConfig);
    for (let id of columnIds) {
      const column = tableConfigClone.columns.find((col) => col.id === id);
      if (column) {
        column.hidden = !column.hidden;
      }
    }
    setTableConfig(tableConfigClone);
  };

  const handleDeleteFilter = (filterId) => {
    setFilters(filters.filter((filter) => filter.id !== filterId));
  };

  const applySavedFilters = (filtersData) => {
    if (!filtersData?.filterJSON) return;
    const filterDefs = JSON.parse(filtersData.filterJSON);
    const columnsToToggle = [];
    const filtersToAdd = [];
    filterDefs.forEach((filter) => {
      const column = tableConfig.columns.find(
        (col) => col.dataProperty === filter.column.dataProperty
      );
      if (!column) return;
      if (column.hidden) {
        columnsToToggle.push(column.id);
      }
      if (column.dataType === "date" && filter.type === "range") {
        filter.value = [moment(filter.value[0]), moment(filter.value[1])];
      }

      filtersToAdd.push(
        filterAddedHelper(
          column,
          filter.type,
          filter.value,
          filter.showSelected
        )
      );
    });
    handleColumnToggleBatch(columnsToToggle);
    setFilters((state) => {
      return filtersToAdd;
    });
    setDrawerToggle(false);
  };

  return (
    <div className={styles.outerContainer}>
      <Drawer
        className={styles.drawer}
        variant="persistent"
        anchor="left"
        open={drawerToggle}
        classes={{
          paper: styles.drawerPaper,
        }}
      >
        <Paper
          elevation={0}
          className={styles.drawerHandle}
          onClick={() => setDrawerToggle((state) => !state)}
        >
          <IconButton
            className={styles.handleIcon}
            classes={{
              root: styles.handleIconRoot,
            }}
          >
            {drawerToggle ? <KeyboardArrowLeftIcon /> : <MenuIcon />}
          </IconButton>
        </Paper>
        <div className={styles.drawerContainer}>
          <List>
            <ListItem key={"fav-filters"}>
              <ListItemIcon>
                <FilterListIcon />
              </ListItemIcon>
              <ListItemText primary={"Filters"} />
            </ListItem>
            {savedFilters.map((filterData) => (
              <ListItem
                onClick={() => applySavedFilters(filterData)}
                button
                key={`filter-${filterData.uuid}`}
              >
                <ListItemText primary={filterData.displayName} />
                <ListItemSecondaryAction
                  onClick={() => deleteSavedFilterHelper(filterData)}
                >
                  <IconButton edge="end" aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Divider />
        </div>
      </Drawer>
      <div className={styles.mainContainer}>
        <div className={styles.filterContainer}>
          <DataTableFilters
            handleFilterRangeLimitClicked={handleFilterRangeLimitClicked}
            handleFilterHideSelectChange={handleFilterHideSelectChange}
            saveFilters={saveFiltersHelper}
            handleDeleteFilter={handleDeleteFilter}
            handleColumnToggle={handleColumnToggle}
            handleFilterRangeCommitted={handleFilterRangeCommitted}
            columns={tableConfig?.columns}
            filters={filters}
            handleFilterAdded={handleFilterAdded}
            handleFilterRangeChange={handleFilterRangeChange}
            handleFilterValueChange={handleFilterValueChange}
          />
        </div>
        <div className={styles.tableContainer}>
          <DataTable
            tableRows={tableSlice}
            config={tableConfig}
            tableAction={tableEventHandler}
          ></DataTable>
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
      flexGrow: 1,
    },
    dataGrid: {
      backgroundColor: "#fff",
    },
  };
});

export default DataTableComponent;
