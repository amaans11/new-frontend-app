import React, { useEffect, useState, useRef } from "react";
import {
  makeStyles,
  LinearProgress,
  Paper,
  IconButton,
} from "@material-ui/core";
import SortIcon from "@material-ui/icons/Sort";
import NavigateBefore from "@material-ui/icons/NavigateBefore";
import NavigateNext from "@material-ui/icons/NavigateNext";

const alignmentMapping = {
  string: "flex-start",
  number: "center",
  currency: "center",
  percent: "center",
  date: "flex-start",
  left: "flex-start",
  right: "flex-end",
  center: "center",
};

// built in action types
const ACTION_DATA_SLICE = "dataSlice";
const ACTION_CELL_UPDATED = "cellUpdated";
const ACTION_COLUMN_OPTION_UPDATED = "columnOptionUpdated";
const ACTION_COLUMN_SORT = "columnSort";

const DEFAULT_COL_WIDTH = 200;

const DataTable = (props) => {
  const styles = useStyles();

  // lower/upper row indices of the current data source being displayed
  var _gridContainerRef = useRef(null);

  const [focusedCell, setFocusedCell] = useState(null);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [windowDimentions, setWindowDimentions] = useState({
    width: null,
    height: null,
  });
  const [pageIndex, setPageIndex] = useState(0);

  if (props.tableRows) {
    var {
      upperRowIdx,
      lowerRowIdx,
      tableRows: currentTableRows,
    } = props.tableRows;
  }
  const currentConfig = props.config;
  var currentPage;

  // Respond to user interaction and send events to default or config defined actions in parent
  const tableAction = (actionName, actionData) => {
    if (currentConfig) {
      const action = currentConfig.actions.find((a) => a.name === actionName);
      if (action) {
        props.tableAction({ type: action.actionType, data: actionData });
        return;
      }
    }
    // default actions must be handled by parent for functionality
    props.tableAction({ type: actionName, data: actionData });
  };

  const getTableSlice = () => {
    lowerRowIdx = lowerRowIdx || 0;
    upperRowIdx = upperRowIdx || currentConfig.rowsPerPage;
    tableAction(ACTION_DATA_SLICE, {
      lowerRowIdx,
      upperRowIdx,
      size: currentConfig.rowsPerPage,
    });
  };

  const handleWindowResize = () => {
    setWindowDimentions({ width: window.width, height: window.height });
  };

  useEffect(() => {
    if (!props.config) return;
    getTableSlice(props.config);
    if (!isDataLoading && !currentTableRows) {
      setIsDataLoading(true);
    }
  }, [props.config]);

  useEffect(() => {
    if (isDataLoading && currentConfig && currentTableRows) {
      setIsDataLoading(false);
    }
  }, [props.tableRows]);

  useEffect(() => {
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  });

  const numberWithCommas = (x) => {
    if (x == null) return "";
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Used by template
  const getRowData = (column, row) => {
    let value = row.data[column.dataProperty];
    switch (column.dataType) {
      case "date":
      case "image":
      case "number":
      case "string":
        break;
      case "currency":
        value = value != null ? `$${numberWithCommas(value)}` : value;
        break;
      case "percent":
        value = value != null ? `${value}%` : value;
        break;
    }
    return value;
  };

  // criteria check for redering input options
  // column must be editable and cell must be focused
  const cellInputOptions = (column, rowIdx, colIdx) => {
    if (
      !(focusedCell && focusedCell[0] === rowIdx && focusedCell[1] === colIdx)
    )
      return;
    if (
      !(currentConfig.editable && currentConfig.editable[column.dataProperty])
    )
      return;
    return currentConfig.editable[column.dataProperty].type;
  };

  const handlePageEvent = (page) => {
    const lastPageIndex =
      Math.ceil(currentConfig.numRows / currentConfig.rowsPerPage) - 1;
    if (page < 0 || page > lastPageIndex) return;
    lowerRowIdx = Math.max(page * currentConfig.rowsPerPage, 0);
    upperRowIdx = lowerRowIdx + currentConfig.rowsPerPage;
    if (upperRowIdx > currentConfig.numRows) {
      upperRowIdx = currentConfig.numRows;
    }
    getTableSlice();
    setFocusedCell(null);
    setPageIndex(page);
  };

  const handleCellChange = (rowIdx, dataType, dataProperty, value) => {
    if (dataType === "number") {
      value = parseFloat(value);
    }
    if (dataType === "string") {
      value = value.toString();
    }
    const originalRowIdx = rowIdx + rowIdx.lowerRowIdx;
    tableAction(ACTION_CELL_UPDATED, {
      rowIdx: originalRowIdx,
      dataType,
      dataProperty,
      value,
    });
  };

  const handleCellClick = (row, column, rowIdx, colIdx, event) => {
    if (!row.actions) return;
    currentConfig.actions.forEach((action) => {
      if (
        row.actions.includes(action.name) &&
        (!action.columnProps.length ||
          action.columnProps.includes(column.dataProperty)) && // action applicable for column
        (!action.showAction || action.showAction(row)) // action applicable for row
      ) {
        const originalRowIdx = rowIdx + lowerRowIdx;
        tableAction(action.name, {
          rowIdx: originalRowIdx,
          dataProperty: column.dataProperty,
        });
      }
    });
    setFocusedCell([rowIdx, colIdx]);
  };

  const handleHeaderClick = (column) => {
    if (!column.sort) return;
    setFocusedCell(null);
    tableAction(ACTION_COLUMN_SORT, {
      dataProperty: column.dataProperty,
      sortDirection: column.sortDirection,
    });
  };

  const handleColumnOptionChange = (column, value) => {
    tableAction(ACTION_COLUMN_OPTION_UPDATED, { column, value });
  };

  const updateCurrentPage = () => {
    if (!lowerRowIdx == undefined || !currentConfig) return;
    currentPage = Math.floor(lowerRowIdx / currentConfig.rowsPerPage);
  };

  const getColumnAlignment = (column, alignmentPref) => {
    if (alignmentPref) {
      return alignmentMapping[alignmentPref];
    }
    if (alignmentMapping[column.dataType]) {
      return alignmentMapping[column.dataType];
    }
    return alignmentMapping.center;
  };

  const getCellStyle = (row, column) => {
    if (!row.cellStyles) return null;
    const styleObjects = [];
    row.cellStyles.forEach((s) => {
      if (
        s.dataProperty.includes("*") ||
        s.dataProperty.includes(column.dataProperty)
      ) {
        styleObjects.push(s.style);
      }
    });
    return Object.assign({}, ...styleObjects);
  };

  const getHeaderCellStyle = (column) => {
    if (!currentConfig.headerCellStyles) return;
    const styleObjects = [];
    currentConfig.headerCellStyles.forEach((s) => {
      if (
        s.dataProperty.includes("*") ||
        s.dataProperty.includes(column.dataProperty)
      ) {
        styleObjects.push(s.style);
      }
    });
    return Object.assign({}, ...styleObjects);
  };

  // const getTextWidth = (text, size) => {
  //   const width = pixelWidth(text, {size})
  //   return `${width}px`
  // }

  const getColumns = () => {
    if (currentConfig) {
      return currentConfig.columns.filter((col) => !col.hidden);
    }
    return null;
  };

  const currentColumns = getColumns();
  const currentColumnsFlexSum = currentColumns
    ? currentColumns.reduce((prev, curr) => {
        const currVal = curr.flex ? curr.flex : 0;
        return prev + currVal;
      }, 0)
    : 0;
  const currentColumnsDefinedWidth = currentColumns
    ? currentColumns.reduce((prev, curr) => {
        const currVal = curr.width
          ? curr.width
          : curr.flex
          ? 0
          : DEFAULT_COL_WIDTH;
        return prev + currVal;
      }, 0)
    : 0;

  const getColumnWidth = (column, header) => {
    var width = DEFAULT_COL_WIDTH;
    if (column.width) {
      width = column.width;
    } else if (column.flex && _gridContainerRef.current) {
      const remainingWidth =
        _gridContainerRef.current.offsetWidth - currentColumnsDefinedWidth;
      if (remainingWidth > 0) {
        const fraction = remainingWidth / currentColumnsFlexSum;
        width = fraction * column.flex;
      }
      return (width = width - 30);
    }
    if (header) {
      return width - column.headerBorderWidth || 0;
    } else {
      return width - column.cellBorderWidth || 0;
    }
  };

  const getRowHeight = (rowIdx) => {
    if (focusedCell && focusedCell[0] === rowIdx) {
      return "400px";
    }
    return "100px";
  };

  return (
    <Paper className={styles.tableOuterContainer} ref={_gridContainerRef}>
      {isDataLoading && <LinearProgress color="secondary" />}
      {!isDataLoading && (
        <>
          <div
            className={`${styles.paginatorContainer} ${styles.tableCellBorderBottomThick}`}
          >
            <IconButton
              component="div"
              onClick={() => handlePageEvent(pageIndex - 1)}
            >
              <NavigateBefore />
            </IconButton>
            <div
              className={styles.paginatorText}
            >{`Showing ${lowerRowIdx} - ${upperRowIdx} of ${currentConfig.numRows}`}</div>
            <IconButton
              component="div"
              onClick={() => handlePageEvent(pageIndex + 1)}
            >
              <NavigateNext />
            </IconButton>
          </div>
          <div className={styles.tableGridScrollContainer}>
            <div className={styles.tableGridInnerContainer}>
              {currentConfig.showHeader && (
                <div
                  style={currentConfig.headerRowStyles}
                  className={`${styles.tableHeaderRow} ${styles.tableCellBorderBottomThick}`}
                >
                  {currentColumns.map((column, colIdx) => {
                    return (
                      <div
                        key={column.id}
                        style={{
                          minWidth: getColumnWidth(column, true),
                          maxWidth: getColumnWidth(column, true),
                          justifyContent: getColumnAlignment(
                            column,
                            column.alignmentHeader
                          ),
                          ...getHeaderCellStyle(column),
                        }}
                        className={`${styles.tableCell} ${styles.tableHeaderCell}`}
                      >
                        <div
                          onClick={() => handleHeaderClick(column)}
                          className={styles.tableHeaderCellDisplay}
                        >
                          {column.sort && column.sortDirection === "asc" && (
                            <SortIcon
                              fontSize="small"
                              className={styles.tableHeaderCellSortImageFlip}
                            />
                          )}
                          {column.sort && column.sortDirection === "desc" && (
                            <SortIcon
                              fontSize="small"
                              className={styles.tableHeaderCellSortImage}
                            />
                          )}
                          <span
                            className={`${styles.tableHeaderCellLabel} ${
                              !column.sort || !column.sortDirection
                                ? styles.tableHeaderCellSortSpacer
                                : ""
                            }`}
                          >
                            {column.displayName}
                          </span>
                        </div>
                        {column.options.length ? (
                          <button className={styles.tableHeaderButton}>
                            <img src="assets/icon/menu-drop-down-open.svg" />
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
              {currentTableRows.map((row, rowIdx) => {
                return (
                  <div
                    key={row.id}
                    style={row.rowStyles}
                    className={`${styles.tableRow} ${
                      rowIdx === currentTableRows.length - 1
                        ? styles.tableCellBorderBottomThick
                        : ""
                    }`}
                    onFocus={() => {
                      console.log("ONFOCUS");
                    }}
                    onBlur={() => {
                      console.log("ONBLUR");
                    }}
                  >
                    {currentColumns.map((column, colIdx) => {
                      return (
                        <div
                          key={column.id}
                          onClick={(event) =>
                            handleCellClick(row, column, rowIdx, colIdx, event)
                          }
                          style={getCellStyle(row, column)}
                        >
                          <div
                            className={styles.tableCell}
                            style={{
                              // minWidth: getColumnWidth(column),
                              // maxWidth: getColumnWidth(column),
                              textAlign: getColumnAlignment(
                                column,
                                column.alignmentRow
                              ),
                              justifyContent: getColumnAlignment(
                                column,
                                column.alignmentRow
                              ),
                            }}
                          >
                            {[
                              "string",
                              "number",
                              "currency",
                              "percent",
                              "date",
                            ].includes(column.dataType) &&
                              getRowData(
                                column,
                                row
                              )
                              // <div className={styles.tableCellStringNumber}>
                              // </div>
                            }
                            {column.dataType === "image" && (
                              <div className={styles.tableCellImage}>
                                {
                                  <img
                                    src={getRowData(column, row)}
                                    onError={() => this.style.display}
                                  />
                                }
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
          <div className={styles.paginatorContainer}>
            <IconButton
              component="div"
              onClick={() => handlePageEvent(pageIndex - 1)}
            >
              <NavigateBefore />
            </IconButton>
            <div
              className={styles.paginatorText}
            >{`Showing ${lowerRowIdx} - ${upperRowIdx} of ${currentConfig.numRows}`}</div>
            <IconButton
              component="div"
              onClick={() => handlePageEvent(pageIndex + 1)}
            >
              <NavigateNext />
            </IconButton>
          </div>
        </>
      )}
    </Paper>
  );
};

const useStyles = makeStyles((theme) => {
  return {
    tableOuterContainer: {
      display: "flex",
      fontSize: "1.4rem",
      flexDirection: "column",
      minHeight: "50vh",
    },
    tableHeaderCell: {
      borderRight: "1px solid #696969",
    },
    tableGridInnerContainer: {
      minWidth: "100%",
      width: "fit-content",
    },
    tableGridScrollContainer: {
      overflowX: "auto",
    },
    tableHeaderRow: {
      display: "flex",
    },
    tableHeaderCellDisplay: {
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
    },
    tableHeaderCellSortImage: {
      marginRight: "10px",
    },
    tableHeaderCellSortImageFlip: {
      marginRight: "10px",
      transform: "rotate(180deg)",
    },
    tableHeaderCellLabel: {
      display: "inline-block",
      overflow: "hidden",
      textAlign: "center"
    },
    tableHeaderCellSortSpacer: {
      // marginLeft: '22px'
    },
    tableHeaderButton: {},
    tableRow: {
      display: "flex",
      "&:hover": {
        backgroundColor: theme.palette.action.hover,
      },
    },
    tableCell: {
      display: "flex",
      minHeight: "48px",
      maxHeight: "100px",
      padding: "5px 15px",
      alignItems: "center",
      minWidth: "100px",
      overflow: "hidden",
      fontWeight: "500",
      color: theme.palette.text.primary,
    },
    tableCellStringNumber: {
      fontSize: "1.6rem",
      color: "#3A3A3A",
      wordBreak: "break-all",
      overflow: "hidden",
      maxHeight: "inherit",
    },
    tableCellImage: {},
    tableCellBorderBottomThick: {
      borderBottom: "5px solid #696969",
    },
    paginatorContainer: {
      height: "48px",
      display: "flex",
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
    },
    paginatorText: {
      padding: "0px 10px",
      fontSize: "1.6rem",
    },
  };
});

export default DataTable;
