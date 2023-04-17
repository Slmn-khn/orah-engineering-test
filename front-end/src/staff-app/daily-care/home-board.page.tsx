import React, { useState, useEffect } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import {
  Toolbar as MUIToolBar,
  Typography,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  TextField,
} from "@material-ui/core";
import { remove, LocalStorageKey, get, add } from "shared/helpers/local-storage"
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import { makeStyles } from "@material-ui/core/styles";
import SearchIcon from "@material-ui/icons/Search";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { RolllStateType, RollInput } from "shared/models/roll"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"


const useStyles = makeStyles((theme) => ({
  root: {
    paddingLeft: theme.spacing(1),
  },
  sortContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  fNametitle: {
    margin: "0 10px 0 0"
  },
  LNametitle: {
    margin: "0 0 0 -15px"
  },
  textFieldRoot: {
    color: "#ffff",
    border: 'solid 1px #ffff',
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#ffff',
      },
      '&:hover fieldset': {
        borderColor: '#ffff',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#ffff',
      },
    },
    "& .MuiFormLabel-root": {
      "& Mui-focused": {
        color: '#ffff !important'
      },
    }
  },
}));



export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [saveActiveRoll] = useApi<RollInput>({ url: "save-roll" })
  const [filteredData, setFilteredData] = React.useState<{ students: Person[] }>()
  const [rollStates, setRollStates] = useState<Record<"present" | "late" | "absent", number>>({ present: 0, late: 0, absent: 0 });

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(() => {
    setFilteredData(data)
    setRollStates(handleRollStateDetails(data?.students || []))
  }, [data])


  const onToolbarAction = (action: ToolbarAction, value?: any) => {
    switch (action) {
      case 'roll':
        setIsRollMode(true);
        break;
      case 'sort':
        sortStudents(value.sortOrder, value.sortByLastName);
        break;
      case 'search':
        handleSearchChange(value.searchQuery)
        break;
      default:
        break;
    }
  }

  const onActiveRollAction = (action: ActiveRollAction, selectedType?: RolllStateType | string) => {
    switch (action) {
      case 'exit':
        setIsRollMode(false);
        break;
      case "complete":
        remove(LocalStorageKey.rolls)
        let localDetails = filteredData?.students.filter((studentDetails: Person) => studentDetails.roll_state);
        localDetails?.map((studentDetails: Person) => {
          saveActiveRoll({ student_roll_states: { student_id: studentDetails.id, roll_state: studentDetails.roll_state } })
        });
        setIsRollMode(false);
        break;
      case 'filter':
        let TempFilter: Array<Person> = get(LocalStorageKey.students) || []
        if (selectedType !== 'all') {
          TempFilter = TempFilter.filter((studentDetails: Person) => studentDetails.roll_state === selectedType)
          setFilteredData({ students: TempFilter || [] })
        } else {
          setFilteredData({ students: TempFilter || [] })
        }
        break;
      default:
        break;
    }
  }

  const sortStudents = (isDescending: boolean, sortByLastName: boolean) => {
    var compareResult: number;
    const sortedStudents = filteredData && filteredData.students.sort((a: Person, b: Person) => {
      let aValue: string;
      let bValue: string;
      if (!sortByLastName) {
        aValue = a.first_name
        bValue = b.first_name
        compareResult = aValue.localeCompare(bValue);
      } else {
        aValue = a.last_name;
        bValue = b.last_name;
        compareResult = aValue.localeCompare(bValue);
      }
      return isDescending ? -compareResult : compareResult;
    });
    setFilteredData({ students: sortedStudents || [] })
  };

  const handleSearchChange = (searchQuery: string) => {
    const searchedStudents = filteredData && filteredData.students.filter((student: Person) => {
      return `${student.first_name} ${student.last_name}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    });
    searchQuery === 'empty' ? setFilteredData({ students: data?.students || [] }) : setFilteredData({ students: searchedStudents || [] })
  };

  const handleRollStateDetails = (studentsDetails: Array<Person>) => {
    let rollStateChange = studentsDetails.reduce((acc: any, student: Person) => {
      const rollState = student?.roll_state;
      if (rollState && rollState in acc) {
        acc[rollState]++;
      } else {
        //@ts-ignore
        acc[rollState] = 1;
      }
      return acc;
    }, {});
    return rollStateChange;
  }

  const handleRollState = (state: RolllStateType, studentID: number) => {
    if (isRollMode) {
      if (filteredData && filteredData?.students.length > 0) {
        const obj = filteredData.students.find((item: Person) => item.id === studentID);
        if (obj) {
          obj.roll_state = state;
        }
        setRollStates(handleRollStateDetails(filteredData.students))
      }
      add(LocalStorageKey.students, filteredData?.students)
    }
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && filteredData && (
          <>
            {filteredData.students.map((s) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s} onRollClick={(state: RolllStateType) => handleRollState(state, s.id)} />
            ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} rollStateInfo={rollStates} />
    </>
  )
}

type ToolbarAction = "roll" | "sort" | "search"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: any) => void
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const classes = useStyles();
  const { onItemClick } = props
  const [sortDescending, setSortDescending] = useState(false);
  const [sortByLastName, setSortByLastName] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  console.log('test')
  const handleSortChange = () => {
    setSortByLastName(!sortByLastName);
    onItemClick("sort", { sortOrder: sortDescending, sortByLastName: !sortByLastName })
  };

  const handleSortToggle = () => {
    setSortDescending(!sortDescending);
    onItemClick("sort", { sortOrder: !sortDescending, sortByLastName: sortByLastName })
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
    onItemClick("search", { searchQuery: event.target.value || "empty" })
  };

  return (
    <S.ToolbarContainer>
      <MUIToolBar className={classes.root}>
        <div className={classes.sortContainer}>
          <Typography className={classes.fNametitle} variant="body2" id="tableTitle">
            First Name
          </Typography>
          <FormControlLabel
            label=''
            control={<Switch checked={sortByLastName ? true : false} onChange={handleSortChange} />}
          />
          <Typography className={classes.LNametitle} variant="body2" id="tableTitle">
            Last Name
          </Typography>
          <Tooltip title="Sort">
            <IconButton aria-label="Sort" onClick={handleSortToggle}>
              {!sortDescending &&
                <KeyboardArrowUpIcon color="secondary" />
              }
              {sortDescending &&
                <KeyboardArrowDownIcon color="secondary" />
              }
            </IconButton>
          </Tooltip>
        </div>
        <TextField
          label="Search by Name"
          style={{ color: 'red' }}
          variant="outlined"
          size="small"
          value={searchValue}
          onChange={handleSearchChange}
          InputProps={{
            className: classes.textFieldRoot,
            endAdornment: (
              <IconButton aria-label="search" edge="end">
                <SearchIcon />
              </IconButton>
            ),
          }}
        />
      </MUIToolBar>
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer >
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
}