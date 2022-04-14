import {GridToolbarContainer, GridToolbarExport} from "@mui/x-data-grid";
import * as React from "react";

function ExportToolbar() {
    return (
        <GridToolbarContainer>
            <GridToolbarExport csvOptions={{ fileName: document.title }} />
        </GridToolbarContainer>
    )
}

export default ExportToolbar;
