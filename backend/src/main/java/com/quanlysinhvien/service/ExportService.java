package com.quanlysinhvien.service;

import com.opencsv.CSVWriter;
import com.quanlysinhvien.model.Student;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.List;

@Service
public class ExportService {

    // ===== CSV Export =====
    public byte[] exportStudentsToCSV(List<Student> students) throws IOException {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        OutputStreamWriter writer = new OutputStreamWriter(out, "UTF-8");
        // BOM for Excel UTF-8
        writer.write('\uFEFF');
        CSVWriter csvWriter = new CSVWriter(writer);

        String[] header = {"Mã SV", "Họ Tên", "Ngày Sinh", "Giới Tính", "Mã Lớp", "Email", "Số Điện Thoại", "Địa Chỉ"};
        csvWriter.writeNext(header);

        for (Student s : students) {
            String[] row = {
                    s.getMaSv(), s.getHoTen(), s.getNgaySinh(), s.getGioiTinh(),
                    s.getMaLop(), s.getEmail(), s.getSoDienThoai(), s.getDiaChi()
            };
            csvWriter.writeNext(row);
        }

        csvWriter.close();
        return out.toByteArray();
    }

    // ===== Excel Export =====
    public byte[] exportStudentsToExcel(List<Student> students) throws IOException {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Danh sách sinh viên");

        // Header style
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        headerStyle.setBorderBottom(BorderStyle.THIN);

        // Header row
        Row headerRow = sheet.createRow(0);
        String[] headers = {"Mã SV", "Họ Tên", "Ngày Sinh", "Giới Tính", "Mã Lớp", "Email", "Số Điện Thoại", "Địa Chỉ"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Data rows
        int rowNum = 1;
        for (Student s : students) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(s.getMaSv() != null ? s.getMaSv() : "");
            row.createCell(1).setCellValue(s.getHoTen() != null ? s.getHoTen() : "");
            row.createCell(2).setCellValue(s.getNgaySinh() != null ? s.getNgaySinh() : "");
            row.createCell(3).setCellValue(s.getGioiTinh() != null ? s.getGioiTinh() : "");
            row.createCell(4).setCellValue(s.getMaLop() != null ? s.getMaLop() : "");
            row.createCell(5).setCellValue(s.getEmail() != null ? s.getEmail() : "");
            row.createCell(6).setCellValue(s.getSoDienThoai() != null ? s.getSoDienThoai() : "");
            row.createCell(7).setCellValue(s.getDiaChi() != null ? s.getDiaChi() : "");
        }

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream out = new ByteArrayOutputStream();
        workbook.write(out);
        workbook.close();
        return out.toByteArray();
    }
}
