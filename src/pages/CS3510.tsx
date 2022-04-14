import * as React from 'react';
import {ParticlesContainer} from "../components/ParticlesContainer";
import classNames from "classnames";
import ExportToolbar from "../components/ExportToolbar";
import {
    DataGridPro,
    gridFilteredSortedRowEntriesSelector,
    useGridApiRef
} from "@mui/x-data-grid-pro";
import {Alert, Button, Paper, Snackbar, Typography} from "@mui/material";
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

function splitOnCamelCase(string: string) {
    let split = [];
    let currentString = "";
    for (let i = 0; i < string.length; i++) {
        if (string.charAt(i).toUpperCase() === string.charAt(i)) {
            if (currentString.length > 0) {
                split.push(currentString);
            }
            currentString = string.charAt(i);
        } else {
            currentString += string.charAt(i);
        }
    }
    if (currentString.length > 0) {
        split.push(currentString);
    }
    return split;
}

function capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function evaluateFinalGradeSeverity(finalGrade: number) {
    if (finalGrade >= 90) {
        return "success";
    } else if (finalGrade >= 80) {
        return "warning";
    } else {
        return "error";
    }
}


function CS3510() {
    const apiRef = useGridApiRef();
    const [displayInfo, setDisplayInfo] = useState("");
    const [finalGrade, setFinalGrade] = useState(0);
    const cacheKey = "cs3510-sp2022-grade-store";
    const [cache, setCache] = useState(JSON.parse(localStorage.getItem(cacheKey) || "{}") || null);

    document.title = "cs3510sp2022"

    function handleClick() {
        const rowEntries = gridFilteredSortedRowEntriesSelector(apiRef);
        // @ts-ignore
        setCache(rowEntries.map((entry) => {
            return entry.model.earnedPoints;
        }));
        const gradeOptions = [0, 1].map((option) => {
            return rowEntries.map((entry) => {
                let weight: string;
                let earnedPoints: number;
                if (entry.model.category.startsWith("Quiz") || entry.model.category.startsWith("Final")) {
                    const options = entry.model.weight.split(" or ");
                    weight = options[option].substring(0, entry.model.weight.length - 1);
                    if (entry.model.category.startsWith("Final") && option === 0) {
                        earnedPoints = 0;
                    } else {
                        earnedPoints = entry.model.earnedPoints;
                    }
                } else {
                    weight = entry.model.weight.substring(0, entry.model.weight.length - 1);
                    earnedPoints = entry.model.earnedPoints;
                }
                return parseFloat(weight) * (earnedPoints / entry.model.possiblePoints);
            }).reduce((x, y) => x + y)
        });
        setFinalGrade(Math.max(...gradeOptions));
    }

    function handleCookie() {
        const rowEntries = gridFilteredSortedRowEntriesSelector(apiRef);
        // @ts-ignore
        setCache(rowEntries.map((entry) => {
            return entry.model.earnedPoints;
        }));
        setDisplayInfo("Your grades have been saved locally as cookies!");
    }

    useEffect(() => {
        if (displayInfo !== "") {
            localStorage.setItem(cacheKey, JSON.stringify(cache));
        }
    }, [cache, displayInfo]);

    useEffect(() => {
        handleClick();
    }, [finalGrade])

    return (
        <div className="CS3510">
            <div id="logo" className={classNames({show: true})} style={{marginTop: '-50px'}}>
                <a href='/'>CS 3510</a>
            </div>
            <ParticlesContainer />
            <div style={{ height: 750, width: '100%', marginTop: '50px' }}>
                <DataGridPro
                    apiRef={apiRef}
                    rows={
                        [
                            ["Class Participation", "", "5%", 5],
                            ["Homework 1", "", "2.14%", 100],
                            ["Homework 2", "", "2.14%", 80],
                            ["Homework 3", "", "2.14%", 100],
                            ["Homework 4", "", "2.14%", 100],
                            ["Homework 5", "", "2.14%", 100],
                            ["Homework 6", "", "2.14%", 100],
                            ["Homework 7", "", "2.14%", 100],
                            ["Quiz 1", "", "20% or 10%", 100],
                            ["Quiz 2", "Add +10 for curve", "20% or 10%", 100],
                            ["Quiz 3", "", "20% or 10%", 100],
                            ["Quiz 4", "", "20% or 10%", 100],
                            ["Final Exam", "Leave empty if you aren't taking final", "0% or 40%", 100],
                            ["Curve", "If they decide to curve the class", "100%", 100],
                        ].map((row, index) => {
                            return {
                                id: index,
                                category: row[0],
                                note: row[1],
                                weight: row[2],
                                possiblePoints: row[3],
                                earnedPoints: cache == null ? 0 : (cache[index] || 0)
                            }}
                        )
                    }
                    columns={
                        [["category", "180"],
                            ["note", "270"],
                            ["weight", "100"],
                            ["possiblePoints", "150"],
                            ["earnedPoints", "150"]].map((column) => {
                                const [columnName, width] = column;
                                return {
                                    field: columnName,
                                    headerName: splitOnCamelCase(capitalizeFirstLetter(columnName)).join(" "),
                                    width: parseInt(width),
                                    editable: columnName === "earnedPoints"
                                }
                        })
                    }
                    experimentalFeatures={{ newEditingApi: true }}
                    components={{
                        Toolbar: ExportToolbar
                    }}
                />
                <span style={{ position: 'absolute', padding: '10px' }}>
                    <Button variant="contained" onClick={handleClick}>Submit</Button>
                </span>
                <span style={{ position: 'absolute', padding: '10px', marginLeft: '95px' }}>
                    <Button variant="outlined" onClick={handleCookie}>Save Grades Locally</Button>
                </span>
                <Typography variant="h2" style={{ position: 'absolute', padding: '20px', marginTop: '50px' }}>{`Your final grade is ${Math.round(finalGrade)}%!`}</Typography>
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

export default withRouter(CS3510);
