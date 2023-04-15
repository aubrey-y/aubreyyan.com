import * as React from 'react';
import {ParticlesContainer} from "../components/ParticlesContainer";
import classNames from "classnames";
import {isMobile} from 'react-device-detect';
import {
    Alert, Box,
    Button, Checkbox, FormControlLabel, FormGroup,
    Snackbar, TextField,
    Typography
} from "@mui/material";
import {useEffect, useState} from "react";

const withRouter = (Component: () => JSX.Element) => {
    const Wrapper = (props: JSX.IntrinsicAttributes) => {

        // @ts-ignore
        return (<Component
                {...props}
            />
        );
    };

    return Wrapper;
};


const TOTAL_POINTS: {
    [key: string]: number
} = {
    exam1: 100,
    exam2: 100,
    exam3: 100,
    exam4: 100,
    hw1: 36,
    hw2: 24,
    hw3: 36,
    hw4: 12,
    hw5: 18,
    hw6: 10,
    proj: 100,
};

const WEIGHTS: {
    [key: string]: number
} = {
    "exam1": 0.15,
    "exam2": 0.15,
    "exam3": 0.15,
    "exam4": 0.15,
    "hw1": 0.09,
    "hw2": 0.09,
    "hw3": 0.09,
    "hw4": 0.09,
    "hw5": 0.09,
    "hw6": 0.09,
    "proj": 0.1,
};

const OUTDATED_COOKIES = ["cs4510-sp2023-grade-store"];


function CS4510() {
    const [displayInfo, setDisplayInfo] = useState("");
    const [finalGrade, setFinalGrade] = useState(0);
    const cacheKey = "cs4510-sp2023-grade-store-1";
    const [cache, setCache] = useState(JSON.parse(localStorage.getItem(cacheKey) || "{}") || null);
    const [mobileAlert, setMobileAlert] = useState(isMobile);
    const [exam1, setExam1] = useState("0");
    const [exam2, setExam2] = useState("0");
    const [exam3, setExam3] = useState("0");
    const [exam4, setExam4] = useState("0");
    const [hw1, setHw1] = useState("0");
    const [hw2, setHw2] = useState("0");
    const [hw3, setHw3] = useState("0");
    const [hw4, setHw4] = useState("0");
    const [hw5, setHw5] = useState("0");
    const [hw6, setHw6] = useState("0");
    const [hw1Bonus, setHw1Bonus] = useState(false);
    const [hw2Bonus, setHw2Bonus] = useState(false);
    const [hw3Bonus, setHw3Bonus] = useState(false);
    const [hw4Bonus, setHw4Bonus] = useState(false);
    const [hw5Bonus, setHw5Bonus] = useState(false);
    const [hw6Bonus, setHw6Bonus] = useState(false);
    const [proj, setProj] = useState("0");
    const [curve, setCurve] = useState("0");
    OUTDATED_COOKIES.forEach((cookie) => localStorage.removeItem(cookie));

    document.title = "cs4510sp2023"

    function acquireRef(id: string) {
        switch (id) {
            case "exam1":
                return exam1
            case "exam2":
                return exam2
            case "exam3":
                return exam3
            case "exam4":
                return exam4
            case "hw1":
                return hw1
            case "hw2":
                return hw2
            case "hw3":
                return hw3
            case "hw4":
                return hw4
            case "hw5":
                return hw5
            case "hw6":
                return hw6
            case "proj":
                return proj
        }
        return proj;
    }

    function acquireSetter(id: string) {
        switch (id) {
            case "exam1":
                return setExam1
            case "exam2":
                return setExam2
            case "exam3":
                return setExam3
            case "exam4":
                return setExam4
            case "hw1":
                return setHw1
            case "hw2":
                return setHw2
            case "hw3":
                return setHw3
            case "hw4":
                return setHw4
            case "hw5":
                return setHw5
            case "hw6":
                return setHw6
            case "proj":
                return setProj
        }
        return setProj;
    }

    function generateTextfields(textfieldData: {
        id: string,
        label: string,
        total: number
    }[]) {
        return textfieldData.map((textfield) => {
            let setter = acquireSetter(textfield.id);
            return <TextField variant="filled" key={textfield.id} id={textfield.id} label={`${textfield.label} (/${textfield.total})`} value={acquireRef(textfield.id)} onChange={(event) => setter(event.target.value)} />
        })
    }

    function updateGrades() {
        let exams: number[] = [];
        let hws: number[] = [];
        let hwBonuses: boolean[] = [hw1Bonus, hw2Bonus, hw3Bonus, hw4Bonus, hw5Bonus, hw6Bonus];
        let projs: number[] = [];
        Object.keys(TOTAL_POINTS).forEach((grade) => {
            let ref = acquireRef(grade);
            let score = Number(ref) / TOTAL_POINTS[grade] * WEIGHTS[grade] * 100;
            if (grade.startsWith("exam")) {
                if (exams.length < 3) {
                    exams.push(score)
                } else {
                    const leastExam = Math.min(...exams);
                    if (score > leastExam) {
                        exams.splice(exams.indexOf(leastExam), 1);
                        exams.push(score);
                    }
                }
            } else if (grade.startsWith("hw")) {
                score = score * (hwBonuses[0] ? 1.05 : 1)
                if (hws.length < 5) {
                    hws.push(score)
                } else {
                    const leastHw = Math.min(...hws);
                    if (score > leastHw) {
                        hws.splice(hws.indexOf(leastHw), 1);
                        hws.push(score);
                    }
                }
                hwBonuses.splice(0, 1);
            } else {
                projs.push(score);
            }
        });
        const finalGrade = [exams, hws, projs].map((category) => category.reduce((partialSum, a) => partialSum + a, 0)).reduce((partialSum, a) => partialSum + a, 0);
        setFinalGrade(finalGrade + Number(curve));
    }

    function handleClick() {
        updateGrades();
        setDisplayInfo("Your grade has been updated!")
    }

    function handleCookie() {
        // @ts-ignore
        localStorage.setItem(cacheKey, JSON.stringify([exam1, exam2, exam3, exam4, hw1, hw2, hw3, hw4, hw5, hw6, proj, curve, hw1Bonus, hw2Bonus, hw3Bonus, hw4Bonus, hw5Bonus, hw6Bonus]))
        setDisplayInfo("Your grades have been saved locally as cookies!");
    }

    useEffect(() => {
        if (cache != null && cache.length > 0) {
            const [exam1CACHE, exam2CACHE, exam3CACHE, exam4CACHE, hw1CACHE, hw2CACHE, hw3CACHE, hw4CACHE, hw5CACHE, hw6CACHE, projCACHE, curveCACHE, hw1BonusCACHE, hw2BonusCACHE, hw3BonusCACHE, hw4BonusCACHE, hw5BonusCACHE, hw6BonusCACHE] = cache;
            setExam1(exam1CACHE);
            setExam2(exam2CACHE);
            setExam3(exam3CACHE);
            setExam4(exam4CACHE);
            setHw1(hw1CACHE);
            setHw2(hw2CACHE);
            setHw3(hw3CACHE);
            setHw4(hw4CACHE);
            setHw5(hw5CACHE);
            setHw6(hw6CACHE);
            setProj(projCACHE);
            setHw1Bonus(hw1BonusCACHE);
            setHw2Bonus(hw2BonusCACHE);
            setHw3Bonus(hw3BonusCACHE);
            setHw4Bonus(hw4BonusCACHE);
            setHw5Bonus(hw5BonusCACHE);
            setHw6Bonus(hw6BonusCACHE);
            setCurve(curveCACHE);
        }
        updateGrades();
    }, [])

    return (
        <div className="CS4510">
            <div id="logo" className={classNames({show: true})} style={{marginTop: '-50px'}}>
                <a href='/'>CS 4510</a>
            </div>
            <ParticlesContainer />

            <div style={{ height: 1080, width: '100%', marginTop: '50px' }}>

                <Box style={{ padding: '20px'}}>
                    <Typography variant="h6" style={{position: "absolute"}}>Exams (45%) (Lowest Dropped)</Typography>
                </Box>


                <Box component="form" autoComplete="off" style={{ padding: '20px'}}>
                    {generateTextfields([
                        {
                            "id": "exam1",
                            "label": "Exam 1",
                            "total": TOTAL_POINTS["exam1"]
                        }, {
                            "id": "exam2",
                            "label": "Exam 2",
                            "total": TOTAL_POINTS["exam2"]
                        }, {
                            "id": "exam3",
                            "label": "Exam 3",
                            "total": TOTAL_POINTS["exam3"]
                        }, {
                            "id": "exam4",
                            "label": "Final Exam",
                            "total": TOTAL_POINTS["exam4"]
                        }
                    ])}
                </Box>

                <Box style={{ padding: '20px'}}>
                    <Typography variant="h6" style={{position: "absolute"}}>Homeworks (45%) (Lowest Dropped) (LaTex Bonus 5% Per Homework)</Typography>
                </Box>

                <Box component="form" autoComplete="off" style={{ padding: '20px'}}>
                    {generateTextfields([
                        {
                            "id": "hw1",
                            "label": "Homework 1",
                            "total": TOTAL_POINTS["hw1"]
                        }, {
                            "id": "hw2",
                            "label": "Homework 2",
                            "total": TOTAL_POINTS["hw2"]
                        }, {
                            "id": "hw3",
                            "label": "Homework 3",
                            "total": TOTAL_POINTS["hw3"]
                        }, {
                            "id": "hw4",
                            "label": "Homework 4",
                            "total": TOTAL_POINTS["hw4"]
                        }, {
                            "id": "hw5",
                            "label": "Homework 5",
                            "total": TOTAL_POINTS["hw5"]
                        }, {
                            "id": "hw6",
                            "label": "Homework 6",
                            "total": TOTAL_POINTS["hw6"]
                        },
                    ])}
                </Box>

                <Box component="form" autoComplete="off" style={{ padding: '20px'}}>
                    <FormGroup >
                        <FormControlLabel control={<Checkbox checked={hw1Bonus} onClick={() => setHw1Bonus(!hw1Bonus)} />} label={<Typography variant="h6" style={{position: "relative"}}>HW1 LaTex+</Typography>} />
                        <FormControlLabel control={<Checkbox checked={hw2Bonus} onClick={() => setHw2Bonus(!hw2Bonus)} />} label={<Typography variant="h6" style={{position: "relative"}}>HW2 LaTex+</Typography>} />
                        <FormControlLabel control={<Checkbox checked={hw3Bonus} onClick={() => setHw3Bonus(!hw3Bonus)} />} label={<Typography variant="h6" style={{position: "relative"}}>HW3 LaTex+</Typography>} />
                        <FormControlLabel control={<Checkbox checked={hw4Bonus} onClick={() => setHw4Bonus(!hw4Bonus)} />} label={<Typography variant="h6" style={{position: "relative"}}>HW4 LaTex+</Typography>} />
                        <FormControlLabel control={<Checkbox checked={hw5Bonus} onClick={() => setHw5Bonus(!hw5Bonus)} />} label={<Typography variant="h6" style={{position: "relative"}}>HW5 LaTex+</Typography>} />
                        <FormControlLabel control={<Checkbox checked={hw6Bonus} onClick={() => setHw6Bonus(!hw6Bonus)} />} label={<Typography variant="h6" style={{position: "relative"}}>HW6 LaTex+</Typography>} />
                    </FormGroup>
                </Box>

                <Box style={{ padding: '20px'}}>
                    <Typography variant="h6" style={{position: "absolute"}}>Final Project (10%)</Typography>
                </Box>

                <Box component="form" autoComplete="off" style={{ padding: '20px'}}>
                    {generateTextfields([
                        {
                            "id": "proj",
                            "label": "Final Project",
                            "total": TOTAL_POINTS["proj"]
                        }
                    ])}
                </Box>

                <Box style={{ padding: '20px'}}>
                    <Typography variant="h6" style={{position: "absolute"}}>Miscellaneous Curve (CIOS) (%)</Typography>
                </Box>

                <Box component="form" autoComplete="off" style={{ padding: '20px'}}>
                    <TextField variant="filled" key="curve" id="curve" label={`Curve (1 = 1%)`} value={curve} onChange={(event) => setCurve(event.target.value)} />
                </Box>

                <span style={{ position: 'absolute', padding: '10px' }}>
                    <Button variant="contained" onClick={handleClick}>Submit</Button>
                </span>
                <span style={{ position: 'absolute', padding: '10px', marginLeft: '95px' }}>
                    <Button variant="outlined" onClick={handleCookie}>Save Grades Locally</Button>
                </span>
                <Typography variant="h2" style={{ position: 'absolute', padding: '20px', marginTop: '50px' }}>{`Your final grade is ${finalGrade.toFixed(3)}% (${
                    Math.round(finalGrade) >= 90 ? "A" :
                        Math.round(finalGrade) >= 80 ? "B" :
                            Math.round(finalGrade) >= 70 ? "C" :
                                Math.round(finalGrade) >= 65 ? "D" : "F"
                })!`}</Typography>
                <Snackbar
                    open={displayInfo !== ""}
                    onClose={() => setDisplayInfo("")}
                    anchorOrigin={{
                        vertical: "bottom",
                        horizontal: "right"
                    }}
                >
                    <Alert
                        onClose={() => setDisplayInfo("")}
                        severity="info"
                        sx={{width: "100%"}}
                    >
                        {displayInfo}
                    </Alert>
                </Snackbar>

            </div>
        </div>
    );
}

export default withRouter(CS4510);
