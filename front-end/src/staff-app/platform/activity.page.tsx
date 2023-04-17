import React, { useState, useEffect } from "react"
import styled from "styled-components"
import Button from "@material-ui/core/ButtonBase"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Spacing, BorderRadius, FontWeight } from "shared/styles/styles"
import { Colors } from "shared/styles/colors"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { Person } from "shared/models/person"
import { useApi } from "shared/hooks/use-api"
import { LocalStorageKey, get } from "shared/helpers/local-storage"
import { RolllStateType } from "shared/models/roll"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import { ActiveRollOverlay, ActiveRollAction } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"

export const ActivityPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(true)
  const [getActivities, data, loadState] = useApi<{ students: Person[] }>({ url: "get-homeboard-students" })
  const [filteredData, setFilteredData] = React.useState<{ students: Person[] }>()
  const [rollStates, setRollStates] = useState<Record<"present" | "late" | "absent", number>>({ present: 0, late: 0, absent: 0 });

  useEffect(() => {
    void getActivities()
  }, [getActivities])

  useEffect(() => {
    setFilteredData(data)
    setRollStates(handleRollStateDetails(data?.students || []))
  }, [data])

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

  const onToolbarAction = (action: ToolbarAction) => {
    if (action === "roll") {
      setIsRollMode(true)
    }
  }

  const onActiveRollAction = (action: ActiveRollAction, selectedType?: RolllStateType | string) => {
    switch (action) {
      case 'exit':
      case "complete":
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

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}
        {loadState === "loaded" && filteredData?.students && (
          <>
            {filteredData.students.map((s) => (
              <StudentListTile key={s.id} isRollMode={true} student={s} />
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

type ToolbarAction = "roll" | "sort"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { onItemClick } = props
  return (
    <S.ToolbarContainer>
      <div onClick={() => onItemClick("sort")}>First Name</div>
      <div>Search</div>
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
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