import { useState } from "react";
import Timer from "./Timer";
import WorkoutList from "./WorkoutList";
import Exercise from "../Constructors/sessionExercise";

function Session() {
    // Holds exercises for this workout only so that refreshing gets rid of selection option
    const [sessionExercises, setSessionExercises] = useState([]);

    function handleAddExercise(exercise) {
        // Convert a library entry into a workout exercise with its own data
        const newExercise = new Exercise(exercise.id, exercise.name);

        // New array created so that the displayed workout can be updated
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