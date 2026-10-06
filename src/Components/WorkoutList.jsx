// generated list of workouts based on relevance to user, muscle group or frequently used
import React, {useState, useEffect, useMemo} from 'react';

// Read custom exercises saved in this browser.
function loadCustomExercises() {
  const savedText = localStorage.getItem('osc-custom-exercises');

  if (savedText === null) {
    return [];
  }

  const savedExercises = JSON.parse(savedText);

  if (!Array.isArray(savedExercises)) {
    throw new Error('Saved exercises must be a list.');
  }

  for (const exercise of savedExercises) {
    if (
      !exercise ||
      typeof exercise.id !== 'string' ||
      typeof exercise.name !== 'string' ||
      exercise.isCustom !== true
    ) {
      throw new Error('Invalid saved exercise.');
    }
  }

  return savedExercises;
}

const WorkoutList = ({onSelectExercise, userFavorites = []}) => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Custom exercise form
  const [customExerciseName, setCustomExerciseName] = useState('');

  // Stores the ID of the exercise this custom exercise is based on.
  const [relatedExerciseId, setRelatedExerciseId] = useState('');
  // Holds a validation message
  const [creationError, setCreationError] = useState('');

  //filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('all');
  const [viewTab, setViewTab] = useState('all'); // 'all', 'frequently_used', 'relevant'

  //track frequently used exercises locally or via props
  const [frequentlyUsedIds, setFrequentlyUsedIds] = useState(userFavorites);

  useEffect(() => {
    const fetchExercises = async () => {

      let savedExercises = [];

      try {
        savedExercises = loadCustomExercises();
      } catch (err) {
          setCreationError('Could not load saved custom exercises.');
      }
      try {
        setLoading(true);
        // ExerciseDB API via RapidAPI or local Kaggle dataset JSON
        const response = await fetch('https://exercisedb.p.rapidapi.com/exercises?limit=100', {
          method: 'GET',
          headers: {
            'X-RapidAPI-Key': process.env.REACT_APP_RAPIDAPI_KEY || '',
            'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setExercises(data.concat(savedExercises));
      } catch (err) {
  console.warn("Exercise API unavailable; using fallback exercises:", err);

  setExercises([
    {
      id: "local-bench-press",
      name: "Bench Press",
      bodyPart: "chest",
      target: "pectorals",
      equipment: "barbell"
    },
    {
      id: "local-squat",
      name: "Squat",
      bodyPart: "upper legs",
      target: "quads",
      equipment: "barbell"
    },
    {
      id: "local-push-up",
      name: "Push-Up",
      bodyPart: "chest",
      target: "pectorals",
      equipment: "body weight"
    }
  ].concat(savedExercises));
} finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  //Extract unique muscle groups/body parts dynamically
  const muscleGroups = useMemo(() => {
    const groups = new Set(exercises.map((ex) => ex.bodyPart).filter(Boolean));
    return ['all', ...Array.from(groups)];
  }, [exercises]);

  //filter logic based on search, selected muscle group, and view tab
  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      //1. Frequently Used filter
      if (viewTab === 'frequently_used' && !frequentlyUsedIds.includes(exercise.id)) {
        return false;
      }

      //2. Muscle Group filter
      const matchesMuscle =
        selectedMuscle === 'all' ||
        exercise.bodyPart?.toLowerCase() === selectedMuscle.toLowerCase();

      //3. Search query filter
      const matchesSearch = exercise.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

      return matchesMuscle && matchesSearch;
    });
  }, [exercises, viewTab, selectedMuscle, searchTerm, frequentlyUsedIds]);

  const handleSelect = (exercise) => {
    //dynamically add to frequently used list when selected
    if (!frequentlyUsedIds.includes(exercise.id)) {
      setFrequentlyUsedIds((prev) => [...prev, exercise.id]);
    }
    if (onSelectExercise) {
      onSelectExercise(exercise);
    }
  };

  function handleCreateExercise() {
    const trimmedName = customExerciseName.trim();

    // Find the exercise selected in the dropdown.
    const relatedExercise = exercises.find(
      (exercise) => String(exercise.id) === relatedExerciseId
    );

    if (!trimmedName) {
      setCreationError('Please enter an exercise name.');
      return;
    }

    if (!relatedExercise) {
      setCreationError('Please select a related exercise.');
      return;
    }

    const nameExists = exercises.some(
      (exercise) =>
        exercise.name.trim().toLowerCase() === trimmedName.toLowerCase()
    );

    if (nameExists) {
      setCreationError('An exercise with that name already exists.');
      return;
    }

    // Start with the related exercise's categories.
    const customExercise = {
      id: `custom-${crypto.randomUUID()}`,
      name: trimmedName,
      bodyPart: relatedExercise.bodyPart,
      target: relatedExercise.target,
      equipment: relatedExercise.equipment,
      relatedExerciseId: relatedExercise.id,
      relatedExerciseName: relatedExercise.name,
      isCustom: true
    };

    // Collect existing custom exercises and append the new one.
    const exercisesToSave = [];

    for (const exercise of exercises) {
      if (exercise.isCustom === true) {
        exercisesToSave.push(exercise);
      }
    }

exercisesToSave.push(customExercise);

try {
  const savedText = JSON.stringify(exercisesToSave);
  localStorage.setItem('osc-custom-exercises', savedText);
} catch (err) {
  setCreationError('Could not save the exercise. Please try again.');
  return;
}

// Display the exercise after it has been saved.
setExercises(exercises.concat(customExercise));

    // Clear filters so that the newly created exercise is visible
    setSearchTerm('');
    setSelectedMuscle('all');
    setViewTab('all');

    setCustomExerciseName('');
    setRelatedExerciseId('');
    setCreationError('');
  }

  if (loading) return <div className="loading-spinner">Loading exercise library...</div>;
  if (error) return <div className="error-message">Error fetching exercises: {error}</div>;

  return (
    <div className="workout-list-container">
      <h2>Workout Exercises</h2>

    <div>
      <label htmlFor="custom-exercise-name">Custom exercise name: </label>
      <input
        id="custom-exercise-name"
        type="text"
        placeholder="Example: Hammer Curls"
        value={customExerciseName}
        onChange={(event) => setCustomExerciseName(event.target.value)}
      />
    </div>

    <div>
      <label htmlFor="related-exercise">Related exercise: </label>
      <select
        id="related-exercise"
        value={relatedExerciseId}
        onChange={(event) => setRelatedExerciseId(event.target.value)}
      >
        <option value="">Select an exercise</option>

        {exercises.map((exercise) => (
          <option key={exercise.id} value={String(exercise.id)}>
            {exercise.name}
          </option>
        ))}
      </select>
    </div>

    <button type="button" onClick={handleCreateExercise}>
       Create Exercise
    </button>

    {creationError && <p role="alert">{creationError}</p>}

      {/* View Tabs: All, Frequently Used */}
      <div className="tab-navigation">
        <button
          className={viewTab === 'all' ? 'tab active' : 'tab'}
          onClick={() => setViewTab('all')}
        >
          All Exercises
        </button>
        <button
          className={viewTab === 'frequently_used' ? 'tab active' : 'tab'}
          onClick={() => setViewTab('frequently_used')}
        >
          Frequently Used ({frequentlyUsedIds.length})
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="filter-controls">
        <input
          type="text"
          placeholder="Search workouts by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-bar"
        />
        <select
          value={selectedMuscle}
          onChange={(e) => setSelectedMuscle(e.target.value)}
          className="muscle-dropdown"
        >
          <option value="all">Filter by Muscle Group</option>
          {muscleGroups
            .filter((m) => m !== 'all')
            .map((muscle) => (
              <option key={muscle} value={muscle}>
                {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
              </option>
            ))}
        </select>
      </div>

      {/*Exercise Grid Display */}
      <div className="exercise-grid">
        {filteredExercises.length === 0 ? (
          <p className="no-results">No exercises match your selection.</p>
        ) : (
          filteredExercises.map((exercise) => (
            <div key={exercise.id} className="exercise-card">
              {exercise.gifUrl && (
                <img
                  src={exercise.gifUrl}
                  alt={exercise.name}
                  loading="lazy"
                  className="exercise-image"
                />
              )}
              <h3 className="exercise-title">{exercise.name}</h3>
              <div className="exercise-meta">
                <span className="badge muscle">{exercise.bodyPart}</span>
                <span className="badge target">{exercise.target}</span>
                <span className="badge equipment">{exercise.equipment}</span>
              </div>

              <button
                onClick={() => handleSelect(exercise)}
                className="select-button"
              >
                Add to Routine
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkoutList;