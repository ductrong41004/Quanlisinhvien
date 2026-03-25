package com.quanlysinhvien.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;
import jakarta.validation.constraints.NotBlank;

@Document(collection = "classes")
public class ClassRoom {

    @Id
    private String id;

    @NotBlank(message = "Mã lớp không được để trống")
    @Indexed(unique = true)
    private String maLop;

    @NotBlank(message = "Tên lớp không được để trống")
    private String tenLop;

    private String khoa;

    private Integer siSo;

    private String namHoc;

    public ClassRoom() {
    }

    public ClassRoom(String id, String maLop, String tenLop, String khoa, Integer siSo, String namHoc) {
        this.id = id;
        this.maLop = maLop;
        this.tenLop = tenLop;
        this.khoa = khoa;
        this.siSo = siSo;
        this.namHoc = namHoc;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMaLop() {
        return maLop;
    }

    public void setMaLop(String maLop) {
        this.maLop = maLop;
    }

    public String getTenLop() {
        return tenLop;
    }

    public void setTenLop(String tenLop) {
        this.tenLop = tenLop;
    }

    public String getKhoa() {
        return khoa;
    }

    public void setKhoa(String khoa) {
        this.khoa = khoa;
    }

    public Integer getSiSo() {
        return siSo;
    }

    public void setSiSo(Integer siSo) {
        this.siSo = siSo;
    }

    public String getNamHoc() {
        return namHoc;
    }

    public void setNamHoc(String namHoc) {
        this.namHoc = namHoc;
    }
}
