package com.unilearn.server.config;

import com.unilearn.server.ai.MaterialChunkService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.concurrent.CompletableFuture;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class AiDataInitializationRunner implements CommandLineRunner {

    private final MaterialChunkService materialChunkService;

    @Override
    public void run(String... args) {
        log.info("Triggering background AI material chunking backfill...");
        CompletableFuture.runAsync(() -> {
            try {
                materialChunkService.backfillAllMaterials(null);
                log.info("Background AI material chunking backfill completed.");
            } catch (Exception e) {
                log.warn("Background AI material chunk backfill notice: {}", e.getMessage());
            }
        });
    }
}
