package com.quanlysinhvien.controller;

import com.quanlysinhvien.model.ClassRoom;
import com.quanlysinhvien.service.ClassRoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/classes")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ClassRoomController {

    private final ClassRoomService classRoomService;

    @GetMapping
    public ResponseEntity<List<ClassRoom>> getAllClasses() {
        return ResponseEntity.ok(classRoomService.getAllClasses());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClassRoom> getClassById(@PathVariable String id) {
        return ResponseEntity.ok(classRoomService.getClassById(id));
    }

    @PostMapping
    public ResponseEntity<ClassRoom> createClass(@Valid @RequestBody ClassRoom classRoom) {
        return ResponseEntity.ok(classRoomService.createClass(classRoom));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClassRoom> updateClass(@PathVariable String id,
                                                  @Valid @RequestBody ClassRoom classRoom) {
        return ResponseEntity.ok(classRoomService.updateClass(id, classRoom));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteClass(@PathVariable String id) {
        classRoomService.deleteClass(id);
        return ResponseEntity.noContent().build();
    }
}
