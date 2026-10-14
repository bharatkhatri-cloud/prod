# Implementation Plan: Multi-Bag Breaking Mix & Mould Filling Traceability

Support mixing multiple substrate bags (e.g., 15 bags) in the bag-breaking machine and filling multiple moulds (e.g., 28 moulds) with complete digital traceability, supporting both sequential range entry and barcode scanning.

---

## 1. Architecture & Workflow Design

```
[ Inoculated & Incubated Bags (SB...) ]
                 │
                 ▼
  ┌───────────────────────────────────────────────┐
  │  Stage 1: Bag Breaking Mix Creation           │
  │  Input: Scan bags OR Enter Range (Start - End)│
  │  Output: Unique Mix ID (e.g. MX-20261014-001) │
  └──────────────────────┬────────────────────────┘
                         │
                         ▼
  ┌───────────────────────────────────────────────┐
  │  Stage 2: Mould Filling from Mix              │
  │  Input: Select Active Mix + Mould Type        │
  │         Scan Moulds OR Enter Range (Start-End)│
  │  Output: Linked Moulds (M...) -> Mix ID       │
  └──────────────────────┬────────────────────────┘
                         │
                         ▼
  ┌───────────────────────────────────────────────┐
  │  Downstream Traceability                      │
  │  Any Mould (M...) -> Mix ID -> All Bag IDs    │
  │  -> Liquid Culture (LC) / Jam (JM) Origins    │
  └───────────────────────────────────────────────┘
```

---

## 2. Key Capabilities & Features

### A. Dual Input Modes for Both Bags & Moulds
1. **Sequential Range Entry**:
   - When bags or moulds have sequential IDs (e.g., bags `SB00100` to `SB00114`, or moulds `M00200` to `M00227`), operator enters the **Start ID** and **End ID**.
   - System auto-generates and validates the entire range (e.g., 15 bags or 28 moulds) with a single click, saving repetitive scans.
2. **Scan / Manual List Entry**:
   - When bags or moulds are non-consecutive or mixed lots, operator scans each barcode with automatic list aggregation and duplicate rejection.

### B. Two-Step or Direct Shop-Floor Flow
- **Direct Mix & Fill Flow**: Operator scans/enters 15 bags $\to$ enters 28 moulds $\to$ links them in one continuous transaction.
- **Batched Mix Flow**: Operator breaks 50 bags into the machine buffer, creating an active `Mix ID` $\to$ multiple mould filling stations draw from that active Mix throughout the shift.

---

## 3. Database & Backend Changes

### A. New Model: `BagMixModel` (`backend/models/bagMixModel.js`)
- `mixId`: String, unique (e.g., `MX-20261014-001`)
- `bagIds`: Array of strings (`["SB00100", "SB00101", ...]`)
- `bagCount`: Number
- `mixedBy`: String (operator/user)
- `mixDate`: Date
- `status`: String (`"ACTIVE"`, `"EXHAUSTED"`)
- `totalMouldsFilled`: Number
- `notes` / `machineId`: String (optional)

### B. Updated Model: `MouldFillingModel` (`backend/models/mouldFillingModel.js`)
- Make `bagId` optional or set to primary mix reference.
- Add `mixId`: String (indexed).
- Add `bagIds`: Array of strings (denormalized for instant querying).

### C. Backend API Endpoints
- `POST /api/v1/bag-mix/create`: Create a new bag mix from an array of bag IDs or sequential range.
- `GET /api/v1/bag-mix/active`: List currently active mixes available for filling.
- `GET /api/v1/bag-mix/:mixId`: Detailed view of a mix, component bags, and filled moulds.
- `POST /api/v1/filledNewMould`: Enhanced to accept either a `mixId` or single `bagId`, supporting array of moulds or sequential range (`mouldStartId` & `mouldEndId`).
- `GET /api/v1/mould-traceability/:mouldId`: Traces any mould back to its Mix ID, component bags, and LC/Jam source.

---

## 4. Frontend UI Enhancements

### Enhanced Mould Filling Screen (`frontend/src/modules/MouldFilling/FillNewMould.jsx`)
1. **Mode Switcher**:
   - **Multi-Bag Mix Mode** (Default/New)
   - **Single Bag Mode** (Existing standard)
2. **Bag Input Section**:
   - Tab 1: **Range Selection** (Start Bag ID, End Bag ID, Preview Count button)
   - Tab 2: **Barcode Scanning** (Live scanned chip list with remove buttons)
   - Tab 3: **Select Existing Active Mix**
3. **Mould Input Section**:
   - Select **Mould Type** from registry dropdown.
   - Tab 1: **Range Selection** (Start Mould ID, End Mould ID, Preview Count button)
   - Tab 2: **Barcode Scanning** (Auto-add on 7-character QR detection)
4. **Summary Card**:
   - Displays: Total Bags in Mix, Total Moulds to Fill, Yield per Bag (e.g., 28 moulds / 15 bags = 1.87 moulds/bag), and Operator Name.

---

## 5. Verification & Testing Plan
- Test creating a mix of 15 sequential bags (`SB...` to `SB...`).
- Test filling 28 moulds (`M...` to `M...`) linked to the mix.
- Verify non-sequential scanning mode for both bags and moulds.
- Test rejection validation (ensuring rejected incubation bags cannot be added to a mix).
- Verify end-to-end traceability query on completed moulds.
