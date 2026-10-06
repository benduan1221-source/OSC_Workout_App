// current session the user will be working on during their workout, where they will log what exersises and weight they are perorming
/*import Timer from "./Timer";

function Session() {
    return(
        <div style={{textAlign: "center", padding:"2rem" }}>
            <h1>Workout Session</h1>
            <Timer/>
        </div>
    );
}

export default Session;

*/

import { useState } from "react";
import Timer from "./Timer";
import WorkoutList from "./WorkoutList";
import Exercise from "../Constructors/sessionExercise";

function Session() {
    const [sessionExercises, setSessionExercises] = useState([]);

    function handleAddExercise(exercise) {
        const newExercise = new Exercise(exercise.id, exercise.name);

        setSessionExercises((previous) => [
            ...previous,
            newExercise
        ]);
    }

    return (
        <div style={{ textAlign: "center", padding: "2rem" }}>
            <h1>Workout Session</h1>
            <Timer />

            <h2>Exercises in This Workout</h2>

            {sessionExercises.length === 0 ? (
                <p>No exercises added yet.</p>
            ) : (
                <ol>
                    {sessionExercises.map((exercise, index) => (
                        <li key={index}>
                            {exercise.exerciseName}
                        </li>
                    ))}
                </ol>
            )}

            <WorkoutList onSelectExercise={handleAddExercise} />
        </div>
    );
}

export default Session;