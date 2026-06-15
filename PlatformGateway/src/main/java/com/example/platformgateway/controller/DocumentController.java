package com.example.platformgateway.controller;

import com.example.platformgateway.service.DocumentService;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/documents")
public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping(value = "/ingest", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Mono<ResponseEntity<Map>> ingestDocument(@RequestParam("file") MultipartFile file) {
        return documentService.ingestDocument(file);
    }

    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> chat(@RequestBody Map<String, Object> chatRequest) {
        return documentService.chatStream(chatRequest);
    }

    @GetMapping
    public Mono<ResponseEntity<Map>> listDocuments() {
        return documentService.listDocuments();
    }

    @DeleteMapping
    public Mono<ResponseEntity<Map>> deleteDocument(@RequestParam("filename") String filename) {
        return documentService.deleteDocument(filename);
    }

    @GetMapping("/preview/{filename}")
    public ResponseEntity<Resource> previewDocument(@PathVariable String filename) {
        return documentService.previewDocument(filename);
    }
}
