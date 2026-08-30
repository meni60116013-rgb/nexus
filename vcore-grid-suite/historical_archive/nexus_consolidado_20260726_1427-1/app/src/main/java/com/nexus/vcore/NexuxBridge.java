package com.nexus.vcore;

import android.content.Context;
import android.webkit.JavascriptInterface;
import java.io.File;
import java.io.FileOutputStream;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;

public class NexuxBridge {
    private Context context;

    public NexuxBridge(Context context) {
        this.context = context;
    }

    @JavascriptInterface
    public boolean saveJSON(String filename, String jsonData) {
        try {
            File dir = context.getExternalFilesDir(null);
            File file = new File(dir, filename);
            FileOutputStream fos = new FileOutputStream(file);
            fos.write(jsonData.getBytes("UTF-8"));
            fos.close();
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @JavascriptInterface
    public String loadJSON(String filename) {
        try {
            File dir = context.getExternalFilesDir(null);
            File file = new File(dir, filename);
            if (!file.exists()) return "";
            BufferedReader br = new BufferedReader(new InputStreamReader(new FileInputStream(file), "UTF-8"));
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = br.readLine()) != null) sb.append(line);
            br.close();
            return sb.toString();
        } catch (Exception e) {
            return "";
        }
    }

    @JavascriptInterface
    public boolean exportJSON(String filename, String jsonData) {
        return saveJSON(filename, jsonData);
    }
}
