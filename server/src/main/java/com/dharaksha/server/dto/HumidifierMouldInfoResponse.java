package com.dharaksha.server.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class HumidifierMouldInfoResponse {
    private boolean success;
    private String  message;
    private long    totalCount;
    private long    totalFiltered;
    private int     totalPages;
    private int     resultPerPage;
    private int     currentPage;
    private int     currentItemCount;
    private List<MouldInfoItem> mouldInfoData;
}
