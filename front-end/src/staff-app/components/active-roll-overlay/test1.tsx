import React, { useState } from "react";

interface Student {
  id: number;
  name: string;
  rollState: "Present" | "Late" | "Absent";
}

export default function RollCall({ students }: { students: Student[] }) {
  const [isRolling, setIsRolling] = useState(false);
  const [rollStates, setRollStates] = useState<
    Record<"Present" | "Late" | "Absent", number>
  >({ Present: 0, Late: 0, Absent: 0 });

  const handleRollClick = () => {
    setIsRolling(!isRolling);
  };

  const handleRollStateClick = (id: number) => (
    newState: "Present" | "Late" | "Absent"
  ) => {
    const updatedStudents = students.map((student) =>
      student.id === id ? { ...student, rollState: newState } : student
    );

    const newRollStates = updatedStudents.reduce(
      (acc, student) => {
        acc[student.rollState]++;
        return acc;
      },
      { Present: 0, Late: 0, Absent: 0 }
    );

    setRollStates(newRollStates);
  };

  return (
    <div>
      <button onClick={handleRollClick}>
        {isRolling ? "End Roll" : "Start Roll"}
      </button>

      {isRolling && (
        <div>
          {students.map((student) => (
            <div key={student.id}>
              <span>{student.name}:</span>
              <RollStateIcon
                rollState={student.rollState}
                onClick={handleRollStateClick(student.id)}
              />
            </div>
          ))}
          <div style={{ backgroundColor: "darkblue", color: "white" }}>
            {Object.entries(rollStates).map(([state, count]) => (
              <div key={state}>
                <span>{state}:</span>
                <span>{count}</span>
              </div>
            ))}
            <div>
              <span>Total:</span> <span>{students.length}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface RollStateIconProps {
  rollState: "Present" | "Late" | "Absent";
  onClick: () => void;
}

function RollStateIcon({ rollState, onClick }: RollStateIconProps) {
  const [hovered, setHovered] = useState(false);
  const backgroundColor =
    rollState === "Present"
      ? "lightgreen"
      : rollState === "Late"
      ? "lightyellow"
      : "pink";

  return (
    <div
      style={{
        backgroundColor: hovered ? backgroundColor : \"white",
        border: `2px solid ${backgroundColor}`,
        width: 50,
        height: 50,
        display: "inline-flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => {
        const states = ["Present", "Late", "Absent"];
        const currentIndex = states.indexOf(rollState);
        const newIndex = (currentIndex + 1) % states.length;
        onClick(states[newIndex]);
      }}
    >
      {rollState[0]}
    </div>
  );
}
