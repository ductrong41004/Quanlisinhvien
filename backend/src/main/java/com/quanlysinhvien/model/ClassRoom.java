package com.quanlysinhvien.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import jakarta.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
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
}
