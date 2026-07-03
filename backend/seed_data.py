import os
import json
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from courses.models import Course, Lesson, Quiz, QuizQuestion, PuzzleChallenge, Achievement

def seed():
    print("Seeding database...")
    
    # 1. Create or get Course
    course, created = Course.objects.get_or_create(
        title="Modern Web Development with React",
        defaults={
            "description": "Learn the fundamentals of building premium modern user interfaces using React.js. Covers components, props, hooks, routing, state management, and real-world project deployments."
        }
    )
    if created:
        print(f"Created Course: {course.title}")
    else:
        print(f"Course already exists: {course.title}")

    # 2. Create or get Lesson 1
    lesson1, l1_created = Lesson.objects.get_or_create(
        course=course,
        title="Introduction to React Components",
        defaults={
            "video_url": "https://www.w3schools.com/html/mov_bbb.mp4",
            "transcript": (
                "React is a component-based Javascript library developed by Meta. "
                "Component-based architecture allows you to write reusable UI blocks. "
                "State is an object that holds information that may change over the lifetime of the component. "
                "Props are read-only properties passed from parents to children."
            ),
            "lesson_order": 1,
            "transcription_status": "COMPLETED"
        }
    )
    if l1_created:
        print(f"Created Lesson 1: {lesson1.title}")
    else:
        print(f"Lesson 1 already exists: {lesson1.title}")

    # Seed Quiz 1 with 5 questions
    quiz1, _ = Quiz.objects.get_or_create(lesson=lesson1, defaults={"title": "Lesson 1 Quiz"})
    # Clear existing questions for Lesson 1 Quiz to avoid duplicates
    QuizQuestion.objects.filter(quiz=quiz1).delete()

    QuizQuestion.objects.create(
        quiz=quiz1,
        question="What is React?",
        options=["A CSS framework", "A component-based Javascript library", "A backend database server", "A browser engine"],
        correct_answer="A component-based Javascript library",
        explanation="React is a Javascript library focused on building user interfaces using a component-based model."
    )
    QuizQuestion.objects.create(
        quiz=quiz1,
        question="What are Props in React?",
        options=["Mutable state variables", "Read-only properties passed from parent to child", "Database query parameters", "CSS layout rules"],
        correct_answer="Read-only properties passed from parent to child",
        explanation="Props (short for properties) are immutable data passed down from a parent component to its children components."
    )
    QuizQuestion.objects.create(
        quiz=quiz1,
        question="What is the Virtual DOM in React?",
        options=[
            "A direct copy of the HTML DOM that is slow to update", 
            "An in-memory representation of the real DOM that React uses to optimize rendering", 
            "A database system for storing React component states", 
            "A browser extension for debugging React components"
        ],
        correct_answer="An in-memory representation of the real DOM that React uses to optimize rendering",
        explanation="The virtual DOM is a lightweight copy of the real DOM that React keeps in memory and syncs with the real DOM to optimize performance."
    )
    QuizQuestion.objects.create(
        quiz=quiz1,
        question="Which of the following is true about React component names?",
        options=["They must start with a lowercase letter", "They must start with a capital letter", "They must contain at least one number", "They must be written in snake_case"],
        correct_answer="They must start with a capital letter",
        explanation="React component names must start with a capital letter to distinguish them from standard HTML tags during JSX compilation."
    )
    QuizQuestion.objects.create(
        quiz=quiz1,
        question="What is the purpose of the render() method in a React class component?",
        options=["To fetch data from an external API", "To initialize the component's state", "To describe what the UI should look like on the screen", "To bind event handlers"],
        correct_answer="To describe what the UI should look like on the screen",
        explanation="The render() method is the only required method in a React class component, returning the JSX that describes the component's UI."
    )
    print("Seeded 5 quiz questions for Lesson 1")

    # 3. Create or get Lesson 2
    lesson2, l2_created = Lesson.objects.get_or_create(
        course=course,
        title="Managing State with React Hooks",
        defaults={
            "video_url": "https://www.w3schools.com/html/movie.mp4",
            "transcript": (
                "Hooks were introduced in React 16.8 to allow functional components to use state and other React features. "
                "The useState hook returns a state value and a function to update it. "
                "The useEffect hook allows you to perform side effects in functional components, "
                "such as data fetching, subscriptions, or manually changing the DOM."
            ),
            "lesson_order": 2,
            "transcription_status": "COMPLETED"
        }
    )
    if l2_created:
        print(f"Created Lesson 2: {lesson2.title}")
    else:
        print(f"Lesson 2 already exists: {lesson2.title}")

    # Seed Quiz 2 with 5 questions
    quiz2, _ = Quiz.objects.get_or_create(lesson=lesson2, defaults={"title": "Lesson 2 Quiz"})
    # Clear existing questions for Lesson 2 Quiz to avoid duplicates
    QuizQuestion.objects.filter(quiz=quiz2).delete()

    QuizQuestion.objects.create(
        quiz=quiz2,
        question="Which Hook is used to handle state in functional components?",
        options=["useEffect", "useState", "useContext", "useReducer"],
        correct_answer="useState",
        explanation="useState is the core hook designed specifically for declaring local state variables in functional components."
    )
    QuizQuestion.objects.create(
        quiz=quiz2,
        question="What is the purpose of useEffect?",
        options=["To style components", "To handle user events", "To perform side effects", "To compile Javascript"],
        correct_answer="To perform side effects",
        explanation="useEffect is used for operations like API calls, subscriptions, timers, and directly updating the DOM."
    )
    QuizQuestion.objects.create(
        quiz=quiz2,
        question="What is a key rule of React Hooks?",
        options=[
            "Hooks can only be called from class components", 
            "Hooks must be called inside loops or conditional blocks", 
            "Hooks can only be called at the top level of functional components", 
            "Hooks can be called anywhere in helper functions"
        ],
        correct_answer="Hooks can only be called at the top level of functional components",
        explanation="React Hooks must be called at the top level of functional components to ensure they execute in the same order on every render."
    )
    QuizQuestion.objects.create(
        quiz=quiz2,
        question="What does the dependencies array in useEffect control?",
        options=["The external libraries imported", "When the effect function should run or re-run", "The list of children components", "The styling classes applied"],
        correct_answer="When the effect function should run or re-run",
        explanation="The dependencies array lists the variables the effect depends on. The effect runs after initial render and subsequently only when any dependency changes."
    )
    QuizQuestion.objects.create(
        quiz=quiz2,
        question="Which hook would you use to memoize a computationally expensive function's result?",
        options=["useCallback", "useMemo", "useRef", "useReducer"],
        correct_answer="useMemo",
        explanation="useMemo memoizes the result of a calculation and returns it, recomputing it only when one of its dependencies changes."
    )
    print("Seeded 5 quiz questions for Lesson 2")

    # 4. Create Achievements (including puzzle achievements)
    achievements = [
        {"title": "First Steps", "description": "Earned your first 20 XP points.", "required_xp": 20, "badge_icon_url": "https://cdn-icons-png.flaticon.com/512/2111/2111320.png"},
        {"title": "Fast Learner", "description": "Reached 50 XP.", "required_xp": 50, "badge_icon_url": "https://cdn-icons-png.flaticon.com/512/2111/2111388.png"},
        {"title": "Quiz Master", "description": "Reached 100 XP.", "required_xp": 100, "badge_icon_url": "https://cdn-icons-png.flaticon.com/512/2111/2111370.png"},
        {"title": "Puzzle Beginner", "description": "Solved your first brain boost puzzle!", "required_xp": 0, "badge_icon_url": "https://cdn-icons-png.flaticon.com/512/3082/3082060.png"},
        {"title": "Logic Master", "description": "Solved 3 logic puzzles in the Brain Boost Zone.", "required_xp": 0, "badge_icon_url": "https://cdn-icons-png.flaticon.com/512/3655/3655580.png"},
        {"title": "Queens Champion", "description": "Successfully solved the Queens region puzzle.", "required_xp": 0, "badge_icon_url": "https://cdn-icons-png.flaticon.com/512/2639/2639683.png"},
        {"title": "Sudoku Expert", "description": "Successfully solved the 6x6 Sudoku puzzle.", "required_xp": 0, "badge_icon_url": "https://cdn-icons-png.flaticon.com/512/1006/1006627.png"},
        {"title": "Pinpoint Detective", "description": "Successfully guessed the category in the Pinpoint game.", "required_xp": 0, "badge_icon_url": "https://cdn-icons-png.flaticon.com/512/1077/1077309.png"},
        {"title": "7-Day Brain Streak", "description": "Maintained a 7-day Brain Boost streak.", "required_xp": 0, "badge_icon_url": "https://cdn-icons-png.flaticon.com/512/2716/2716354.png"},
    ]
    for ach in achievements:
        Achievement.objects.get_or_create(title=ach["title"], defaults=ach)
    print("Added achievements")

    # 5. Create Daily Puzzle Challenges (LinkedIn Games style)
    # Clear existing programming puzzles first
    PuzzleChallenge.objects.all().delete()
    print("Cleared existing programming puzzles from the database.")

    puzzles = [
        {
            "title": "6x6 Sudoku Sprint",
            "category": "logic",
            "points": 15,
            "answer": "correct",
            "active": True,
            "prompt": json.dumps({
                "type": "sudoku",
                "difficulty": "Easy",
                "instructions": "Place numbers 1-6 such that every row, column, and 2x3 grid block contains each number exactly once.",
                "grid": [
                    [1, 0, 3, 0, 5, 0],
                    [0, 5, 0, 1, 0, 3],
                    [2, 0, 4, 0, 6, 0],
                    [0, 6, 0, 2, 0, 4],
                    [3, 0, 5, 0, 1, 0],
                    [0, 1, 0, 3, 0, 5]
                ],
                "solution": [
                    [1, 2, 3, 4, 5, 6],
                    [4, 5, 6, 1, 2, 3],
                    [2, 3, 4, 5, 6, 1],
                    [5, 6, 1, 2, 3, 4],
                    [3, 4, 5, 6, 1, 2],
                    [6, 1, 2, 3, 4, 5]
                ]
            })
        },
        {
            "title": "Queens Garden",
            "category": "logic",
            "points": 20,
            "answer": "correct",
            "active": True,
            "prompt": json.dumps({
                "type": "queens",
                "difficulty": "Medium",
                "instructions": "Place exactly one Queen in each row, column, and colored region. Queens cannot occupy adjacent cells (including diagonally).",
                "gridSize": 6,
                "regions": [
                    [0, 0, 0, 1, 1, 1],
                    [3, 3, 0, 1, 1, 4],
                    [3, 3, 2, 2, 2, 4],
                    [3, 5, 5, 2, 2, 4],
                    [3, 5, 5, 5, 4, 4],
                    [3, 5, 5, 5, 5, 4]
                ],
                "solution": [
                    [0, 1],
                    [1, 4],
                    [2, 2],
                    [3, 0],
                    [4, 5],
                    [5, 3]
                ]
            })
        },
        {
            "title": "Tango Balance",
            "category": "logic",
            "points": 15,
            "answer": "correct",
            "active": True,
            "prompt": json.dumps({
                "type": "tango",
                "difficulty": "Medium",
                "instructions": "Fill the grid with Suns (☀️) and Moons (🌙). Each row/column must have 3 of each, no 3 consecutive identical symbols, and follow '=' (same) or 'x' (opposite) indicators.",
                "gridSize": 6,
                "initial": [
                    ["sun", None, None, None, "sun", None],
                    [None, "sun", None, "sun", None, None],
                    ["sun", None, "sun", None, None, "moon"],
                    [None, None, None, None, "moon", None],
                    [None, "moon", None, "moon", None, "moon"],
                    ["moon", None, "moon", None, None, "sun"]
                ],
                "rowConstraints": [
                    {"row": 0, "col1": 1, "col2": 2, "type": "x"},
                    {"row": 2, "col1": 3, "col2": 4, "type": "x"}
                ],
                "colConstraints": [
                    {"col": 0, "row1": 1, "row2": 2, "type": "x"},
                    {"col": 4, "row1": 0, "row2": 1, "type": "x"}
                ],
                "solution": [
                    ["sun", "moon", "sun", "moon", "sun", "moon"],
                    ["moon", "sun", "moon", "sun", "moon", "sun"],
                    ["sun", "moon", "sun", "moon", "sun", "moon"],
                    ["moon", "sun", "moon", "sun", "moon", "sun"],
                    ["sun", "moon", "sun", "moon", "sun", "moon"],
                    ["moon", "sun", "moon", "sun", "moon", "sun"]
                ]
            })
        },
        {
            "title": "Zip Line Path",
            "category": "logic",
            "points": 15,
            "answer": "correct",
            "active": True,
            "prompt": json.dumps({
                "type": "zip",
                "difficulty": "Easy",
                "instructions": "Draw a single continuous path connecting cells from 1 to 16. Every cell in the 4x4 grid must be visited exactly once.",
                "gridSize": 4,
                "numbers": {
                    "1": [0, 0],
                    "6": [1, 2],
                    "11": [2, 2],
                    "16": [3, 0]
                },
                "solution": [
                    [0, 0], [0, 1], [0, 2], [0, 3],
                    [1, 3], [1, 2], [1, 1], [1, 0],
                    [2, 0], [2, 1], [2, 2], [2, 3],
                    [3, 3], [3, 2], [3, 1], [3, 0]
                ]
            })
        },
        {
            "title": "Pinpoint Clues",
            "category": "word",
            "points": 15,
            "answer": "brown",
            "active": True,
            "prompt": json.dumps({
                "type": "pinpoint",
                "difficulty": "Easy",
                "instructions": "Guess the common category for the 5 clues. Reveal them one by one. Fewer clues = higher score!",
                "clues": ["Coffee", "Chocolate", "Chestnut", "Caramel", "Copper"],
                "category": "Shades of Brown",
                "synonyms": ["brown", "shades of brown", "shades of brown color", "brown shades", "browns"]
            })
        },
        {
            "title": "Crossclimb Word Ladder",
            "category": "word",
            "points": 20,
            "answer": "correct",
            "active": True,
            "prompt": json.dumps({
                "type": "crossclimb",
                "difficulty": "Medium",
                "instructions": "Solve clues to find words, then drag them to form a word ladder (each word differs by 1 letter). Finally, solve the top & bottom words.",
                "ladder": [
                    {"clue": "Naked or uncovered", "answer": "BARE"},
                    {"clue": "To cook in the oven", "answer": "BAKE"},
                    {"clue": "The bottom support or foundation", "answer": "BASE"},
                    {"clue": "A large bundle of paper or hay", "answer": "BALE"}
                ],
                "topWord": {"clue": "A fast-running long-eared mammal", "answer": "HARE", "ladderConnect": "BARE"},
                "bottomWord": {"clue": "A valley or low land between hills", "answer": "VALE", "ladderConnect": "BALE"}
            })
        },
        {
            "title": "Grid Patches Challenge",
            "category": "iq",
            "points": 15,
            "answer": "correct",
            "active": True,
            "prompt": json.dumps({
                "type": "patches",
                "difficulty": "Hard",
                "instructions": "Partition the grid into non-overlapping rectangles or squares. Each patch must contain exactly one clue number, which equals its cell count.",
                "gridSize": 4,
                "clues": [
                    {"row": 0, "col": 0, "value": 4},
                    {"row": 0, "col": 3, "value": 2},
                    {"row": 2, "col": 2, "value": 6},
                    {"row": 3, "col": 0, "value": 4}
                ],
                "solution": [
                    {"r1": 0, "c1": 0, "r2": 1, "c2": 1},
                    {"r1": 0, "c1": 2, "r2": 0, "c2": 3},
                    {"r1": 1, "c1": 2, "r2": 3, "c2": 3},
                    {"r1": 2, "c1": 0, "r2": 3, "c2": 1}
                ]
            })
        },
        {
            "title": "Wend Word Flow",
            "category": "memory",
            "points": 20,
            "answer": "correct",
            "active": True,
            "prompt": json.dumps({
                "type": "wend",
                "difficulty": "Medium",
                "instructions": "Find the hidden words by tracing connections (horizontal, vertical, diagonal) through letters. Each letter in the grid must be used exactly once.",
                "grid": [
                    ["C", "A", "T", "B"],
                    ["H", "O", "S", "L"],
                    ["E", "P", "E", "U"],
                    ["W", "I", "N", "D"]
                ],
                "wordLengths": [4, 4, 4, 4],
                "words": ["CATS", "HOPE", "BLUE", "WIND"]
            })
        }
    ]

    for pz in puzzles:
        PuzzleChallenge.objects.create(
            title=pz["title"],
            category=pz["category"],
            points=pz["points"],
            answer=pz["answer"],
            active=pz["active"],
            prompt=pz["prompt"]
        )
    print("Added 8 new LinkedIn-style brain puzzles successfully!")

    print("Seeding completed successfully!")

if __name__ == "__main__":
    seed()
