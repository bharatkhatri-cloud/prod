package com.dharaksha.server.util;

import org.springframework.data.mongodb.core.query.Criteria;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Date;

public class DateFilterUtil {

    private DateFilterUtil() {}

    public static boolean hasDateFilter(String startDate, String endDate) {
        return (startDate != null && !startDate.isBlank())
                || (endDate != null && !endDate.isBlank());
    }

    public static Criteria buildDateCriteria(String startDate, String endDate, String field) {
        boolean hasStart = startDate != null && !startDate.isBlank();
        boolean hasEnd   = endDate   != null && !endDate.isBlank();

        // only endDate → single day; only startDate → startDate up to today
        LocalDate sDate = hasStart
                ? LocalDate.parse(startDate, DateTimeFormatter.ISO_LOCAL_DATE)
                : LocalDate.parse(endDate,   DateTimeFormatter.ISO_LOCAL_DATE);

        LocalDate eDate = hasEnd
                ? LocalDate.parse(endDate, DateTimeFormatter.ISO_LOCAL_DATE)
                : LocalDate.now();

        Date start = Date.from(sDate.atStartOfDay(ZoneOffset.UTC).toInstant());
        Date end   = Date.from(eDate.plusDays(1).atStartOfDay(ZoneOffset.UTC).toInstant());

        return Criteria.where(field).gte(start).lt(end);
    }
}
