import {
  Button,
  Checkbox,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  makeStyles,
  Menu,
  Paper,
  Slider,
  Switch,
  TextField,
  Typography,
  withStyles,
} from "@material-ui/core";
import ValueLabel from "@material-ui/core/Slider/ValueLabel";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import DeleteIcon from "@material-ui/icons/Delete";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import SaveIcon from "@material-ui/icons/Save";
import ViewWeekIcon from "@material-ui/icons/ViewWeek";
import Autocomplete from "@material-ui/lab/Autocomplete";
import moment from "moment";
import React, { useEffect, useState } from "react";

const DataTableFilters = (props) => {
  const styles = useStyles();

  const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState(null);
  const [columnMenuAnchorEl, setColumnMenuAnchorEl] = useState(null);
  const [subMenuState, setSubMenuState] = useState(new Set());
  const [columnMenuOpen, setColumnMenuOpen] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [filterName, setFilterName] = useState();

  const {
    saveFilters,
    columns,
    filters,
    handleFilterRangeLimitClicked,
    handleFilterAdded,
    handleFilterRangeChange,
    handleFilterHideSelectChange,
    handleFilterValueChange,
    handleFilterRangeCommitted,
    handleColumnToggle,
    handleDeleteFilter,
  } = props;

  useEffect(() =>{
    
  },[filters])

  const visibleColumns = columns?.filter((col) => !col.hidden);


  if(filters && filters.length > 0){
    filters.forEach(filter => {
      if(filter.options && filter.options.length > 0){
        filter.options.sort();
      }
    });
  }
  

  console.log("filters>>",filters)
  const handleFilterMenuOpen = (event) => {
    setFilterMenuAnchorEl(event.currentTarget);
  };

  const handleFilterMenuClose = () => {
    setSubMenuState(new Set());
    setFilterMenuAnchorEl(null);
  };

  const handleColumnMenuOpen = (event) => {
    setColumnMenuAnchorEl(event.currentTarget);
  };

  const handleColumnMenuToggle = (toggleState) => {
    setColumnMenuOpen(toggleState);
  };

  const handleColumnMenuClose = () => {
    setColumnMenuAnchorEl(null);
  };

  const handleSaveDialogToggle = () => {
    setSaveDialogOpen((state) => !state);
  };

  const handleCollapseMenuClicked = (columnName) => {
    setSubMenuState((state) => {
      const newState = new Set(state);
      if (newState.has(columnName)) {
        newState.delete(columnName);
      } else {
        newState.add(columnName);
      }
      return newState;
    });
  };

  const addFilter = (column, type) => {
    handleFilterAdded(column, type);
    handleFilterMenuClose();
  };

  const getSubMenuItems = (column) => {
    switch (column.dataType) {
      case "date":
        return (
          <>
            <ListItem
              key="item-range"
              button
              className={styles.nested}
              onClick={() => addFilter(column, "range")}
            >
              <ListItemText primary="Range" />
            </ListItem>
            <ListItem
              key="item-data"
              button
              className={styles.nested}
              onClick={() => addFilter(column, "value")}
            >
              <ListItemText primary="Date" />
            </ListItem>
          </>
        );
      case "percent":
      case "currency":
      case "number":
        return (
          <>
            <ListItem
              key="item-range"
              button
              className={styles.nested}
              onClick={() => addFilter(column, "range")}
            >
              <ListItemText primary="Range" />
            </ListItem>
            <ListItem
              key="item-value"
              button
              className={styles.nested}
              onClick={() => addFilter(column, "value")}
            >
              <ListItemText primary="Value" />
            </ListItem>
          </>
        );
    }
  };

  const getFilterMenuItems = () => {
    const items = [];
    visibleColumns.map((col) => {
      if (col.dataType === "string") {
        items.push(
          <ListItem key={col.id} button onClick={() => addFilter(col, "value")}>
            <ListItemText primary={col.displayName} />
          </ListItem>
        );
      } else {
        items.push(
          <ListItem
            key={`${col.id}-button`}
            button
            onClick={() => handleCollapseMenuClicked(col.displayName)}
          >
            <ListItemText primary={col.displayName} />
            {subMenuState.has(col.displayName) ? (
              <ExpandLess style={{ marginRight: "20px" }} />
            ) : (
              <ExpandMore style={{ marginRight: "20px" }} />
            )}
          </ListItem>
        );
        items.push(
          <Collapse
            key={`${col.id}-collapse`}
            in={subMenuState.has(col.displayName)}
            timeout="auto"
            unmountOnExit
          >
            <List component="div" disablePadding>
              {getSubMenuItems(col)}
            </List>
          </Collapse>
        );
      }
    });
    return items;
  };

  const valueLabelFormat = (value) => {
    var newValue = Number(value);
    var numLength = String(newValue).match(/\d/g).length;
    if (numLength > 5) {
      const [coefficient, exponent] = newValue
        .toExponential()
        .split("e")
        .map((item) => Number(item));
      newValue = `${coefficient.toFixed(2)}e^${exponent}`;
    }
    return <div className={styles.valueLabelText}>{newValue}</div>;
  };

  const valueLabelFormatDate = (value) => {
    return (
      <div className={styles.valueLabelText}>
        {moment(value).format("Y-MM-DD")}
      </div>
    );
  };

  const numberWithCommas = (x) => {
    if (x == null) return "";
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const formatRaw = (raw) => {
    console.log("raw>>",raw)
    if(!raw || raw == 0){
      return "0000-00-00";
    }
    if (raw.inspect().includes("invalid")) {
      return "0000-00-00";
    }
    return raw.format("YYYY-MM-DD");
  };

  const getFilterMarksFromRaw = (filter, value) => {
    const getVal = (val) => {
      if (filter.column.dataType === "date") {
        return val.format("YYYY-MM-DD");
      }
      return val;
    };
    return filter.marks.find((mark) => getVal(mark.rawValue) === getVal(value))
      .value;
  };

  const getRawFromFilterMarks = (filter, val) => {
    let raw = val;
    if (filter.column.dataType === "currency") {
      raw = raw != null ? `$${numberWithCommas(raw)}` : null;
    }
    console.log("val>>",val)
    console.log("filter>>",filter)

    if (filter.column.dataType === "date") {
      raw = formatRaw(raw);
    }
    return raw;
  };

  const getFilter = (filterData) => {
    switch (filterData.column.dataType) {
      case "currency":
      case "percent":
      case "number":
        if (filterData.type === "range") {
          let maxvalue;
          if(filterData.column.dataType === 'date'){
             maxvalue = moment(filterData.commitedRange[1]).format("YYYY-MM-DD")
          }
          else{
             maxvalue = getRawFromFilterMarks(
              filterData,
              filterData.rangeValue[1]
            ).slice(1).toString().replace(/,/g, '')
          }
          
          console.log("maxvalue>>",maxvalue)
         
          maxvalue = parseInt(maxvalue)
          console.log("maxvalue>1>",maxvalue)

          return (
            <Grid item xs={12} sm={6} key={filterData.id}>
              <Paper className={styles.filterRangeItem}>
                <div className={styles.sliderLabelContainer}>
                  <Typography
                    className={styles.sliderLabel}
                    component="span"
                    variant={"h6"}
                  >
                    {filterData.column.displayName}
                  </Typography>
                  <div className={styles.sliderLabelMinMax}>
                    {!filterData.minOpen ? (
                      <Typography
                        onClick={() =>
                          handleFilterRangeLimitClicked(filterData.id, "min")
                        }
                        className={styles.sliderLabelMin}
                        component="span"
                        variant={"subtitle1"}
                      >{moment(filterData.commitedRange[0].format("YYYY-MM-DD"))}</Typography>
                    ) : (
                      <Autocomplete
                        onClose={() =>
                          handleFilterRangeLimitClicked(filterData.id, "min")
                        }
                        open
                        disableCloseOnSelect
                        className={styles.minAutocomplete}
                        options={filterData.marks.map((mark) => mark.rawValue)}
                        getOptionLabel={(option) => {
                          if (option == null) return null;
                          if (filterData.column.dataType === "currency") {
                            return option != null
                              ? `$${numberWithCommas(option)}`
                              : "null";
                          }
                          return option.toString();
                        }}
                        onChange={(_, value) => {
                          if (value === filterData.commitedRange[0]) return;
                          const newValue = [
                            getFilterMarksFromRaw(filterData, value),
                            filterData.rangeValue[1],
                          ];
                          handleFilterRangeCommitted(filterData.id, newValue);
                        }}
                        renderInput={(params) => {
                          return (
                            <TextField
                              autoFocus
                              {...params}
                              variant="outlined"
                              color="secondary"
                              label=""
                            />
                          );
                        }}
                        disableClearable
                        size="small"
                        multiple={false}
                        limitTags={0}
                      ></Autocomplete>
                    )}
                    {!filterData.maxOpen ? (
                      <Typography
                        onClick={() =>
                          handleFilterRangeLimitClicked(filterData.id, "max")
                        }
                        className={styles.sliderLabelMax}
                        component="span"
                        variant={"subtitle1"}
                      >{`Max: ${moment(filterData.commitedRange[1].format("YYYY-MM-DD"))}`}</Typography>
                    ) : (
                      <Autocomplete
                        onClose={() =>
                          handleFilterRangeLimitClicked(filterData.id, "max")
                        }
                        open
                        disableCloseOnSelect
                        className={styles.maxAutocomplete}
                        options={filterData.marks.map((mark) => mark.rawValue)}
                        onChange={(_, value) => {
                          if (value === filterData.commitedRange[1]) return;
                          const newValue = [
                            filterData.rangeValue[0],
                            getFilterMarksFromRaw(filterData, value),
                          ];
                          handleFilterRangeCommitted(filterData.id, newValue);
                        }}
                        getOptionLabel={(option) => {
                          if (option == null) return null;
                          if (filterData.column.dataType === "currency") {
                            return option != null
                              ? `$${numberWithCommas(option)}`
                              : "null";
                          }
                          return option.toString();
                        }}
                        renderInput={(params) => {
                          return (
                            <TextField
                              autoFocus
                              {...params}
                              variant="outlined"
                              color="secondary"
                              label=""
                            />
                          );
                        }}
                        disableClearable
                        size="small"
                        multiple={false}
                        limitTags={0}
                      ></Autocomplete>
                    )}
                  </div>
                </div>
                <div className={styles.filterRangeSlider}>
                  <IconButton
                    edge="start"
                    className={styles.deleteIcon}
                    size="small"
                    component="span"
                    onClick={() => handleDeleteFilter(filterData.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <Slider
                    classes={{
                      valueLabel: styles.valueLabel,
                    }}
                    ValueLabelComponent={StyledValueLabel}
                    // valueLabelFormat={valueLabelFormat}
                    valueLabelDisplay="auto"
                    value={filterData.rangeValue}
                    onChange={(_, newValue) => {
                      console.log("newValue>>",newValue)
                      handleFilterRangeChange(filterData.id, newValue);
                    }}
                    onChangeCommitted={(_, newValue) => {
                      handleFilterRangeCommitted(filterData.id, newValue);
                    }}
                    max={filterData.max}
                    min={filterData.min}
                    color="secondary"
                    step={10000000}

                  />
                  <div className={styles.sliderContainer}>
                    <div>Hide</div>
                    <div>
                      <Switch
                        className={styles.slider}
                        size="small"
                        checked={filterData.showSelected}
                        onChange={(event) =>
                          handleFilterHideSelectChange(filterData.id)
                        }
                      />
                    </div>
                    <div>Show</div>
                  </div>
                </div>
              </Paper>
            </Grid>
          );
        } else if (filterData.type === "value") {
          return (
            <Grid item xs={12} sm={6} key={filterData.id}>
              <Paper className={styles.filterValueItem}>
                <IconButton
                  className={styles.deleteIcon}
                  size="small"
                  component="span"
                  onClick={() => handleDeleteFilter(filterData.id)}
                >
                  <DeleteIcon />
                </IconButton>
                <Autocomplete
                  classes={{
                    root: styles.autoComplete,
                  }}
                  onChange={(_, values) => {
                    handleFilterValueChange(filterData.id, values);
                  }}
                  disableCloseOnSelect
                  multiple
                  limitTags={5}
                  options={filterData.options}
                  getOptionLabel={(option) => {
                    if (option == null) return null;
                    return option.toString();
                  }}
                  value={filterData.selected}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      color="secondary"
                      label={filterData.column.displayName}
                    />
                  )}
                />
                <div className={styles.sliderContainer}>
                  <div>Hide</div>
                  <div>
                    <Switch
                      className={styles.slider}
                      size="small"
                      checked={filterData.showSelected}
                      onChange={(event) =>
                        handleFilterHideSelectChange(filterData.id)
                      }
                    />
                  </div>
                  <div>Show</div>
                </div>
              </Paper>
            </Grid>
          );
        }
        break;
      case "date":
        if (filterData.type === "range") {
          return (
            <Grid item xs={12} sm={6} key={filterData.id}>
              <Paper className={styles.filterRangeItem}>
                {/* <div className={styles.sliderLabelContainer}>
                    <Typography className={styles.sliderLabel} component='span' variant={'h6'}>{filterData.column.displayName}</Typography>
                    <div className={styles.sliderLabelMinMax}>
                      <Typography className={styles.sliderLabelMin} component='span' variant={'subtitle1'}>{`Min: ${getRawFromFilterMarks(filterData, filterData.rangeValue[0])}`}</Typography>
                      <Typography className={styles.sliderLabelMax} component='span' variant={'subtitle1'}>{`Max: ${getRawFromFilterMarks(filterData, filterData.rangeValue[1])}`}</Typography>
                    </div>
                  </div> */}
                <div className={styles.sliderLabelContainer}>
                  <Typography
                    className={styles.sliderLabel}
                    component="span"
                    variant={"h6"}
                  >
                    {filterData.column.displayName}
                  </Typography>
                  <div className={styles.sliderLabelMinMax}>
                    {!filterData.minOpen ? (
                      <Typography
                        onClick={() =>
                          handleFilterRangeLimitClicked(filterData.id, "min")
                        }
                        className={styles.sliderLabelMin}
                        component="span"
                        variant={"subtitle1"}
                      >{`Min: ${getRawFromFilterMarks(
                        filterData,
                        filterData.rangeValue[0]
                      )}`}</Typography>
                    ) : (
                      <Autocomplete
                        onClose={() =>
                          handleFilterRangeLimitClicked(filterData.id, "min")
                        }
                        open
                        className={styles.minAutocomplete}
                        disableCloseOnSelect
                        options={filterData.marks.map((mark) =>
                          formatRaw(mark.rawValue)
                        )}
                        getOptionLabel={(option) => {
                          if (option == null) return null;
                          return option.toString();
                        }}
                        onChange={(_, value) => {
                          const mntVal = moment(value);
                          if (mntVal.isSame(filterData.commitedRange[0]))
                            return;
                          const newValue = [
                            getFilterMarksFromRaw(filterData, mntVal),
                            filterData.rangeValue[1],
                          ];
                          handleFilterRangeCommitted(filterData.id, newValue);
                        }}
                        renderInput={(params) => {
                          return (
                            <TextField
                              autoFocus
                              {...params}
                              variant="outlined"
                              color="secondary"
                              label=""
                            />
                          );
                        }}
                        disableClearable
                        size="small"
                        multiple={false}
                        limitTags={0}
                      ></Autocomplete>
                    )}
                    {!filterData.maxOpen ? (
                      <Typography
                        onClick={() =>
                          handleFilterRangeLimitClicked(filterData.id, "max")
                        }
                        className={styles.sliderLabelMax}
                        component="span"
                        variant={"subtitle1"}
                      >Max</Typography>
                    ) : (
                      <Autocomplete
                        onClose={() =>
                          handleFilterRangeLimitClicked(filterData.id, "max")
                        }
                        className={styles.maxAutocomplete}
                        open
                        disableCloseOnSelect
                        options={filterData.marks.map((mark) =>
                          formatRaw(mark.rawValue)
                        )}
                        onChange={(_, value) => {
                          const mntVal = moment(value);
                          if (mntVal.isSame(filterData.commitedRange[1]))
                            return;
                          const newValue = [
                            filterData.rangeValue[0],
                            getFilterMarksFromRaw(filterData, mntVal),
                          ];
                          handleFilterRangeCommitted(filterData.id, newValue);
                        }}
                        getOptionLabel={(option) => {
                          if (option == null) return null;
                          return option.toString();
                        }}
                        renderInput={(params) => {
                          return (
                            <TextField
                              autoFocus
                              {...params}
                              variant="outlined"
                              color="secondary"
                              label=""
                            />
                          );
                        }}
                        disableClearable
                        size="small"
                        multiple={false}
                        limitTags={0}
                      ></Autocomplete>
                    )}
                  </div>
                </div>
                <div className={styles.filterRangeSlider}>
                  <IconButton
                    edge="start"
                    className={styles.deleteIcon}
                    size="small"
                    component="span"
                    onClick={() => handleDeleteFilter(filterData.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                  <Slider
                    classes={{
                      valueLabel: styles.valueLabel,
                    }}
                    ValueLabelComponent={StyledValueLabel}
                    valueLabelFormat={valueLabelFormatDate}
                    valueLabelDisplay="off"
                    value={filterData.rangeValue}
                    onChange={(_, newValue) =>
                      handleFilterRangeChange(filterData.id, newValue)
                    }
                    onChangeCommitted={(_, newValue) => {
                      handleFilterRangeCommitted(filterData.id, newValue);
                    }}
                    max={filterData.max}
                    min={filterData.min}
                    color="secondary"
                  />
                  <div className={styles.sliderContainer}>
                    <div>Hide</div>
                    <div>
                      <Switch
                        className={styles.slider}
                        size="small"
                        checked={filterData.showSelected}
                        onChange={(event) =>
                          handleFilterHideSelectChange(filterData.id)
                        }
                      />
                    </div>
                    <div>Show</div>
                  </div>
                </div>
              </Paper>
            </Grid>
          );
        } else if (filterData.type === "value") {
          return (
            <Grid item xs={12} sm={6} key={filterData.id}>
              <Paper className={styles.filterValueItem}>
                <IconButton
                  className={styles.deleteIcon}
                  size="small"
                  component="span"
                  onClick={() => handleDeleteFilter(filterData.id)}
                >
                  <DeleteIcon />
                </IconButton>
                <Autocomplete
                  classes={{
                    root: styles.autoComplete,
                  }}
                  onChange={(_, values) => {
                    handleFilterValueChange(filterData.id, values);
                  }}
                  disableCloseOnSelect
                  multiple
                  value={filterData.selected}
                  limitTags={5}
                  options={filterData.options}
                  getOptionLabel={(option) => {
                    if (option == null) return null;
                    return option.toString();
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      variant="outlined"
                      label={filterData.column.displayName}
                      color="secondary"
                    />
                  )}
                />
                <div className={styles.sliderContainer}>
                  <div>Hide</div>
                  <div>
                    <Switch
                      className={styles.slider}
                      size="small"
                      checked={filterData.showSelected}
                      onChange={(event) =>
                        handleFilterHideSelectChange(filterData.id)
                      }
                    />
                  </div>
                  <div>Show</div>
                </div>
              </Paper>
            </Grid>
          );
        }
        break;
      case "string":
        return (
          <Grid item xs={12} sm={6} key={filterData.id}>
            <Paper className={styles.filterValueItem}>
              <IconButton
                className={styles.deleteIcon}
                size="small"
                component="span"
                onClick={() => handleDeleteFilter(filterData.id)}
              >
                <DeleteIcon />
              </IconButton>
              <Autocomplete
                classes={{
                  root: styles.autoComplete,
                }}
                onChange={(_, options) => {
                  handleFilterValueChange(filterData.id, options);
                }}
                disableCloseOnSelect
                multiple
                limitTags={2}
                options={filterData.options}
                getOptionLabel={(option) => {
                  if (option == null) return null;
                  return option.toString();
                }}
                value={filterData.selected}
                renderInput={(params) => {
                  return (
                    <TextField
                      {...params}
                      variant="outlined"
                      label={filterData.column.displayName}
                      color="secondary"
                    />
                  );
                }}
              />
              <div className={styles.sliderContainer}>
                <div>Hide</div>
                <div>
                  <Switch
                    className={styles.slider}
                    color="default"
                    size="small"
                    checked={filterData.showSelected}
                    onChange={(event) =>
                      handleFilterHideSelectChange(filterData.id)
                    }
                  />
                </div>
                <div>Show</div>
              </div>
            </Paper>
          </Grid>
        );
      default:
        return (
          <Grid item xs={12} sm={6} key={filterData.id}>
            <Paper className={styles.filterItem}>Filter / Facet</Paper>
          </Grid>
        );
    }
  };

  return (
    <>
      <div className={styles.filterContainer}>
        <Grid container spacing={3}>
          {visibleColumns?.length && (
            <Grid item xs={6} sm={6} key="new-filter">
              <Paper className={`${styles.filterButtonContainer}`}>
                <Paper
                  elevation={0}
                  className={`${styles.filterAddColumnButton} ${
                    filters.length ? styles.rightRadiusGone : ""
                  }`}
                  onClick={handleFilterMenuOpen}
                >
                  <AddCircleOutlineIcon
                    style={{ color: "#FFFF" }}
                    fontSize="small"
                  ></AddCircleOutlineIcon>
                </Paper>
                {filters.length ? (
                  <Paper
                    onClick={handleSaveDialogToggle}
                    elevation={0}
                    className={`${styles.filterSaveButton} ${styles.leftRadiusGone}`}
                  >
                    <SaveIcon fontSize="small" />
                  </Paper>
                ) : null}
              </Paper>
              <Menu
                transitionDuration={0}
                anchorOrigin={{ horizontal: "left", vertical: "bottom" }}
                anchorReference={null}
                PaperProps={{
                  className: styles.filterMenu,
                }}
                // className={styles.filterMenu}
                anchorEl={filterMenuAnchorEl}
                open={Boolean(filterMenuAnchorEl)}
                onClose={handleFilterMenuClose}
              >
                {getFilterMenuItems()}
              </Menu>
            </Grid>
          )}
          {visibleColumns?.length && (
            <Grid item xs={6} sm={6} key="new-column">
              {!columnMenuOpen && (
                <Paper>
                  <Paper
                    elevation={0}
                    className={`${styles.filterItemNew} ${styles.filterItem} ${styles.filterItemNewButton}`}
                    onClick={() => handleColumnMenuToggle(true)}
                  >
                    <ViewWeekIcon fontSize="small"></ViewWeekIcon>
                  </Paper>
                </Paper>
              )}
              {columnMenuOpen && (
                <Autocomplete
                  classes={{
                    root: styles.autoComplete,
                  }}
                  onChange={(_, value) => {
                    handleColumnToggle(value.id);
                  }}
                  disableCloseOnSelect
                  multiple={false}
                  limitTags={0}
                  groupBy={(option) => (option.hidden ? "" : " ")}
                  options={columns
                    .sort((colA, colB) => {
                      if (!colA.hidden && colB.hidden) return -1;
                      if (!colB.hidden && colA.hidden) return 1;
                      return 0;
                    })
                    .map((col) => ({
                      name: col.displayName,
                      hidden: col.hidden,
                      id: col.id,
                    }))}
                  getOptionLabel={(option) => {
                    if (option == null) return null;
                    return option.name;
                  }}
                  renderInput={(params) => {
                    params.InputProps.startAdornment = []; // we dont want to show the chips
                    return (
                      <TextField
                        InputProps={{
                          classes: { notchedOutline: { borderColor: "black" } },
                        }}
                        autoFocus
                        {...params}
                        variant="outlined"
                        color="secondary"
                      />
                    );
                  }}
                  renderOption={(option) => (
                    <>
                      <Checkbox
                        color="default"
                        size="small"
                        checked={!option.hidden}
                        style={{ marginRight: 8 }}
                      />
                      {option.name}
                    </>
                  )}
                  open={columnMenuOpen}
                  onClose={() => handleColumnMenuToggle(false)}
                  disableClearable
                  size="small"
                />
              )}
            </Grid>
          )}
          {filters.map((filter) => getFilter(filter))}
        </Grid>
      </div>
      <Dialog open={saveDialogOpen} onClose={handleSaveDialogToggle}>
        <DialogTitle>Save Current Filter</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter a name for your filter
          </DialogContentText>
          <TextField
            onInput={(event) => setFilterName(event.target.value)}
            autoFocus
            margin="none"
            color="secondary"
            label="Filter Name"
            type="text"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveDialogToggle}>Cancel</Button>
          <Button
            onClick={() => {
              saveFilters(filterName);
              setFilterName("");
              handleSaveDialogToggle();
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const StyledValueLabel = withStyles({
  circle: {
    width: "52px",
    height: "52px",
    // backgroundColor: '#a1a7c7'
    // backgroundColor: '#ed6666'
  },
  offset: {
    top: "-56px",
  },
})(ValueLabel);

const useStyles = makeStyles((theme) => {
  return {
    slider: {
      // marginLeft: '20px'
    },
    sliderContainer: {
      display: "flex",
      marginLeft: "20px",
    },
    minAutocomplete: {
      width: "150px",
    },
    maxAutocomplete: {
      width: "150px",
      marginLeft: "20px",
    },
    filterMenu: {
      [theme.breakpoints.down("md")]: {
        width: "calc(50% - 12px)",
      },
      [theme.breakpoints.down("lg")]: {
        width: "calc(450px - 12px)",
      },
      [theme.breakpoints.up("lg")]: {
        width: "calc(600px - 12px)",
      },
      [theme.breakpoints.up("xl")]: {
        width: "calc(850px - 12px)",
      },
      maxHeight: "40vh",
      marginTop: "5px",
    },
    filterButtonContainer: {
      height: "40px",
      display: "flex",
      width: "100%",
    },
    filterAddColumnButton: {
      flexGrow: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      fontSize: "1.4rem",
      textAlign: "center",
      backgroundColor: "inherit",
      "&:hover": {
        backgroundColor: theme.palette.action.hover,
      },
    },
    rightRadiusGone: {
      borderTopRightRadius: 0,
      borderBottomRightRadius: 0,
    },
    leftRadiusGone: {
      borderTopLeftRadius: 0,
      borderBottomLeftRadius: 0,
    },
    filterSaveButton: {
      width: "50px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      fontSize: "1.4rem",
      textAlign: "center",
      "&:hover": {
        backgroundColor: theme.palette.action.hover,
      },
    },
    sliderLabelContainer: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "0px 3px",
    },
    sliderLabel: {
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    sliderLabelMinMax: {
      flexGrow: 1,
      paddingLeft: "20px",
      overflow: "hidden",
      display: "flex",
      justifyContent: "flex-end",
    },
    sliderLabelMin: {
      maxWidth: "50%",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    sliderLabelMax: {
      marginLeft: "20px",
      maxWidth: "50%",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    valueLabelText: {
      color: "white",
    },
    valueLabel: {
      left: "auto",
    },
    deleteIcon: {
      marginRight: "20px",
      height: "30px",
      width: "30px",
      padding: "0px",
    },
    autoComplete: {
      flexGrow: 1,
    },
    filterValueItem: {
      minHeight: "62px",
      fontSize: "1.4rem",
      padding: "10px 30px",
      display: "flex",
      alignItems: "center",
    },
    filterContainer: {},
    nested: {
      paddingLeft: "30px",
    },
    filterRangeInput: {
      marginRight: "30px",
      width: "100px",
    },
    filterRangeItem: {
      minHeight: "60px",
      fontSize: "1.4rem",
      padding: "10px 30px",
    },
    filterRangeSlider: {
      display: "flex",
      alignItems: "flex-end",
    },
    filterItem: {
      textAlign: "center",
      padding: "10px 30px",
      fontSize: "1.4rem",
      height: "60px",
      display: "flex",
    },
    filterItemNew: {
      cursor: "pointer",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "20px",
    },
    filterItemNewButton: {
      "&:hover": {
        backgroundColor: theme.palette.action.hover,
      },
      flexGrow: 1,
    },
    colAText: {
      fontSize: "1.8rem",
    },
  };
});

export default DataTableFilters;
