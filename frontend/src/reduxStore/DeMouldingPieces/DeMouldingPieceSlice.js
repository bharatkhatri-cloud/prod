import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const fetchToDeMouldNewPiece = createAsyncThunk('deMouldingPieces/fetchToDeMouldNewPiece', async (dataOfNewDeMouldPiece) => {
    try {
        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/deMouldNewPiece`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(dataOfNewDeMouldPiece),
            credentials: 'include'
        })

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            return errorData
        }

        const data = await response.json();
        toast.success(data.message)
        return data

    } catch (error) {
        console.error("The new piece is not de moulded!! something went wrong: ", error);
        throw error;
    }
})



// Thunk for fetching bag inoculation data
export const fetchDeMouldPiecesData = createAsyncThunk(
    "deMouldingPieces/fetchDeMouldPiecesData",
    async (queryParams) => {
        try {

            const params = new URLSearchParams(queryParams);

            const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
            const url = `${BACK_HOST}api/v1/getDeMouldPieceData?${params}`;
            const response = await fetch(url, {
                method: "GET",
                credentials: 'include'
            });

            if (!response.ok) {
                const errorData = await response.json();
                toast.error(errorData.message);
                throw new Error("Failed to fetch data of De-Mould Piece Data");
            }

            const data = await response.json();
            return data;

        } catch (error) {
            console.log("De-Mould Piece Data Is Not Fetch Some Error Is occur:- ", error);
        }
    }
);


export const fetchToDeleteDeMouldPiecesData  = createAsyncThunk("deMouldingPieces/fetchToDeleteDeMouldPiecesData", async (id) => {
    try {

        console.log("id",id);
        
        const BACK_HOST = process.env.REACT_APP_BACKEND_PORT_AND_HOST;
        const url = `${BACK_HOST}api/v1/admin/deleteDeMouldingPieceData/${id}`;
        const response = await fetch(url, {
            method: 'DELETE',
            credentials:"include"
        });

        if (!response.ok) {
            const errorData = await response.json();
            toast.error(errorData.message);
            throw new Error(errorData.message || "Failed to delete De-Moulding Piece data.");
        }

        const data = await response.json();
        toast.success(data.message);
        return data;

    } catch (error) {
        console.error("Error while deleting De-Moulding Piece data: ", error);
        throw error;
    }
});



export const deMouldingPieceSlice = createSlice({
    name: "deMouldingPiece",

    initialState: {
        isLoading: false,
        data: null,
        isError: false,
    },
    reducers: {},
    extraReducers: (builder) => {


        builder.addCase(fetchToDeMouldNewPiece.pending, (state) => {
            state.isLoading = true;
        }).addCase(fetchToDeMouldNewPiece.fulfilled, (state, action) => {
            state.isLoading = false;
            state.data = action.payload;
        }).addCase(fetchToDeMouldNewPiece.rejected, (state, action) => {
            console.log("Error", action.payload);
            state.isError = true;
        });

        builder.addCase(fetchDeMouldPiecesData.pending, (state) => {
            state.isLoading = true;
        }).addCase(fetchDeMouldPiecesData.fulfilled, (state, action) => {
            state.isLoading = false;
            state.data = action.payload;
        }).addCase(fetchDeMouldPiecesData.rejected, (state, action) => {
            console.log("Error", action.payload);
            state.isError = true;
        });

                  
        builder.addCase(fetchToDeleteDeMouldPiecesData.pending, (state) => {
                        state.isLoading = true;
                    })
                    .addCase(fetchToDeleteDeMouldPiecesData.fulfilled, (state, action) => {
                        state.isLoading = false;
                        state.data = action.payload;
                    })
                    .addCase(fetchToDeleteDeMouldPiecesData.rejected, (state, action) => {
                        state.isLoading = false;
                        state.isError = true;
                    })

    },
});

export default deMouldingPieceSlice.reducer;