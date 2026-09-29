package com.unilearn.server.ai;

import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class TextChunker {

    // ~800-1000 tokens
    public static final int TARGET_CHUNK_CHARS = 3500;
    // ~100 tokens overlap
    public static final int OVERLAP_CHARS = 400;

    // split text into overlapping chunks
    public List<String> splitIntoChunks(String text) {
        List<String> chunks = new ArrayList<>();
        if (text == null || text.isBlank()) {
            return chunks;
        }

        String cleaned = text.trim();
        if (cleaned.length() <= TARGET_CHUNK_CHARS) {
            chunks.add(cleaned);
            return chunks;
        }

        // split paragraphs
        String[] paragraphs = cleaned.split("\\n\\n+");
        StringBuilder currentChunk = new StringBuilder();

        for (String para : paragraphs) {
            String trimmedPara = para.trim();
            if (trimmedPara.isEmpty()) continue;

            // split long paragraphs by sentence
            if (trimmedPara.length() > TARGET_CHUNK_CHARS) {
                String[] sentences = trimmedPara.split("(?<=[.!?])\\s+");
                for (String sentence : sentences) {
                    if (sentence.isBlank()) continue;
                    appendSegment(chunks, currentChunk, sentence);
                }
            } else {
                appendSegment(chunks, currentChunk, trimmedPara);
            }
        }

        if (currentChunk.length() > 0) {
            String finalChunk = currentChunk.toString().trim();
            if (!finalChunk.isEmpty()) {
                chunks.add(finalChunk);
            }
        }

        return chunks;
    }

    private void appendSegment(List<String> chunks, StringBuilder currentChunk, String segment) {
        if (currentChunk.length() + segment.length() + 2 > TARGET_CHUNK_CHARS && currentChunk.length() > 0) {
            String chunkStr = currentChunk.toString().trim();
            chunks.add(chunkStr);

            // carry overlap to next chunk
            String overlap = "";
            if (chunkStr.length() > OVERLAP_CHARS) {
                overlap = chunkStr.substring(chunkStr.length() - OVERLAP_CHARS);
                // trim to word boundary
                int firstSpace = overlap.indexOf(' ');
                if (firstSpace != -1 && firstSpace < 50) {
                    overlap = overlap.substring(firstSpace + 1);
                }
            } else {
                overlap = chunkStr;
            }

            currentChunk.setLength(0);
            if (!overlap.isBlank()) {
                currentChunk.append(overlap).append("\n\n");
            }
        }

        if (currentChunk.length() > 0 && !currentChunk.toString().endsWith("\n\n")) {
            currentChunk.append("\n\n");
        }
        currentChunk.append(segment);
    }
}
