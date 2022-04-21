import * as React from 'react';
import {ParticlesContainer} from "../components/ParticlesContainer";
import classNames from "classnames";
import ExportToolbar from "../components/ExportToolbar";
import {
    DataGridPro,
    gridFilteredSortedRowEntriesSelector,
    useGridApiRef
} from "@mui/x-data-grid-pro";
import {isMobile} from 'react-device-detect';
import {
    Alert,
    Button, darken,
    Dialog, DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle, lighten,
    Paper,
    Snackbar,
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

const getBackgroundColor = (color: string, mode: string) =>
    mode === 'dark' ? darken(color, 0.6) : lighten(color, 0.6);

const getHoverBackgroundColor = (color: string, mode: string) =>
    mode === 'dark' ? darken(color, 0.5) : lighten(color, 0.5);


function CS3510() {
    const apiRef = useGridApiRef();
    const [displayInfo, setDisplayInfo] = useState("");
    const [finalGrade, setFinalGrade] = useState(0);
    const cacheKey = "cs3510-sp2022-grade-store";
    const [cache, setCache] = useState(JSON.parse(localStorage.getItem(cacheKey) || "{}") || null);
    const [mobileAlert, setMobileAlert] = useState(isMobile)
    const [droppedItems, setDroppedItems] = useState([]);

    document.title = "cs3510sp2022"

    function handleClick() {
        const rowEntries = gridFilteredSortedRowEntriesSelector(apiRef);
        // @ts-ignore
        setCache(rowEntries.map((entry) => {
            return entry.model.earnedPoints;
        }));
        // @ts-ignore
        setDroppedItems(["Final Exam"]);
        const gradeOptions = [0].map((_) => {
            const droppedHomework = rowEntries.filter((entry) => entry.model.category.startsWith("Homework"))
                .reduce((prev, curr) => parseInt(prev.model.earnedPoints)/parseInt(prev.model.possiblePoints) < parseInt(curr.model.earnedPoints)/parseInt(curr.model.possiblePoints) ? prev : curr).model.category;
            const droppedQuiz = rowEntries.filter((entry) => entry.model.category.startsWith("Quiz"))
                .reduce((prev, curr) => parseInt(prev.model.earnedPoints)/parseInt(prev.model.possiblePoints) < parseInt(curr.model.earnedPoints)/parseInt(curr.model.possiblePoints) ? prev : curr);
            const finalGrade = rowEntries.filter((entry) => entry.model.category.startsWith("Final"))[0].model.earnedPoints;
            return rowEntries.filter((entry) => !entry.model.category.startsWith("Final")).map((entry) => {
                let weight: string;
                let earnedPoints: number;
                if (entry.model.category === droppedQuiz.model.category && parseInt(droppedQuiz.model.earnedPoints) < finalGrade) {
                    earnedPoints = finalGrade;
                    setDroppedItems((prevState => prevState.filter((item) => item !== "Final Exam").concat(entry.model.category)));
                } else {
                    if (entry.model.category.startsWith("Homework") && entry.model.category === droppedHomework) {
                        earnedPoints = 0;
                        setDroppedItems((prevState => prevState.concat(entry.model.category)));
                    } else {
                        earnedPoints = entry.model.earnedPoints;
                    }
                }
                weight = entry.model.weight.substring(0, entry.model.weight.length - 1);
                return parseFloat(weight) * (earnedPoints / entry.model.possiblePoints);
            }).reduce((x, y) => x + y)
        });
        setFinalGrade(Math.max(...gradeOptions));
        setDisplayInfo("Your grade has been updated!")
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
                            ["Homework 1", "", "2.5%", 100],
                            ["Homework 2", "", "2.5%", 80],
                            ["Homework 3", "", "2.5%", 100],
                            ["Homework 4", "", "2.5%", 100],
                            ["Homework 5", "", "2.5%", 100],
                            ["Homework 6", "", "2.5%", 100],
                            ["Homework 7", "", "2.5%", 100],
                            ["Quiz 1", "", "20%", 100],
                            ["Quiz 2", "Add +10 for curve", "20%", 100],
                            ["Quiz 3", "", "20%", 100],
                            ["Quiz 4", "", "20%", 100],
                            ["Final Exam", "Final replaces lowest quiz if it will help your grade", "20% or 0%", 100],
                            ["Curve", "If they decide to curve the class", "100%", 100],
                        ].map((row, index) => {

                            return {
                                id: index,
                                category: row[0],// @ts-ignore
                                note: row[0].startsWith("Homework") && droppedItems.includes(row[0].toString()) ? "Lowest homework dropped" : row[1],
                                weight: row[2],
                                possiblePoints: row[3],
                                earnedPoints: cache == null ? 0 : (cache[index] || 0)
                            }}
                        )
                    }
                    columns={
                        [["category", "180"],
                            ["note", "350"],
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
                    sx={{
                        '& .dropped': {
                            bgcolor: (theme) => getBackgroundColor(theme.palette.error.main, theme.palette.mode),
                            '&:hover': {
                                bgcolor: (theme) => getHoverBackgroundColor(theme.palette.error.main, theme.palette.mode)
                            }
                        }
                    }}
                    // @ts-ignore
                    getRowClassName={(params => droppedItems.includes(params.row.category) ? 'dropped' : '')}
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
                <Dialog
                    open={mobileAlert}
                    onClose={() => setMobileAlert(false)}
                    aria-labelledby="alert-dialog-title"
                    aria-describedby="alert-dialog-description"
                >
                    <DialogTitle id="alert-dialog-title">
                        Your mobile device is not supported
                    </DialogTitle>
                    <DialogContent>
                        <DialogContentText id="alert-dialog-description">
                            The library used for data entry (mui/x Data Grid Pro) does not work with mobile and I do not know why.
                            In order to use this tool properly, access from a computer browser. Also, I am totally pirating their
                            software lol.
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setMobileAlert(false)} autoFocus>
                            Acknowledge
                        </Button>
                    </DialogActions>
                </Dialog>
            </div>
        </div>
    );
}

export default withRouter(CS3510);
