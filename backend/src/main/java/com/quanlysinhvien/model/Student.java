package com.quanlysinhvien.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "students")
public class Student {

    @Id
    private String id;

    @NotBlank(message = "Mã sinh viên không được để trống")
    @Indexed(unique = true)
    private String maSv;

    @NotBlank(message = "Họ tên không được để trống")
    private String hoTen;

    private String ngaySinh;

    private String gioiTinh; // "Nam" or "Nữ"

    private String maLop;

    @Email(message = "Email không hợp lệ")
    private String email;

    @Pattern(regexp = "^(0[0-9]{9})$", message = "Số điện thoại không hợp lệ")
    private String soDienThoai;

    private String diaChi;
}
