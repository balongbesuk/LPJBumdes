import re
import json
import os

# Raw OCR text from simpan pinjam.pdf
POKOK_TEXT_P1 = """
1 P-001 Sri Jayanti 50.000 - - - - - - 50.000 
2 P-002 Adi Kuswantoro 50.000 - - - - - - 50.000 
3 P-003 Agus Ain - - - - - - - 
4 P-004 Alimah 50.000 - - - - - - 50.000 
5 P-005 Tri Yuliarsih 50.000 - - - - - - 50.000 
6 P-006 Kuswinarti 50.000 - - - - - - 50.000 
7 P-007 Hariyanto 50.000 - - - - - - 50.000 
8 P-008 Giyanto 50.000 - - - 50.000 - 50.000 - 
9 P-009 Imroatus Sholichah - - - - - - - - 
10 P-010 Teguh Prasetya - - - - - - - - 
11 P-011 Djayos 50.000 - - - - - - 50.000 
12 P-012 Sutriman 50.000 - - - - - - 50.000 
13 P-013 Sasdji Abdullah - - - - - - - - 
14 P-014 M. Hadi Praitno 50.000 - - - - - - 50.000 
15 P-015 Anwar Wibisono 50.000 - - - - - - 50.000 
16 P-016 Choirul Anwar 50.000 - - - - - - 50.000 
17 P-017 Towardi 50.000 - - - - - - 50.000 
18 P-018 Choriyah 50.000 - - - - - - 50.000 
19 P-019 Muji Santoso - - - - - - - - 
20 P-020 Muhammad Arifin 50.000 - - - - - - 50.000 
21 P-021 Tri Endah 50.000 - - - - - - 50.000 
22 P-022 Siti Nur afifa 50.000 - - - - - - 50.000 
23 P-023 Susi Sri Wahyuni 50.000 - - - - - - 50.000 
24 P-024 Hari Bayudi 50.000 - - - - - - 50.000 
25 P-025 Ilham Hendrik 50.000 - - - - - - 50.000 
26 P-026 Abdul Rochman 50.000 - - - - - - 50.000 
27 P-027 Bagus Setiawan 50.000 - - - - - - 50.000 
28 P-028 Dwi Cahyorini 50.000 - - - - - - 50.000 
29 P-029 Mamik Kurianawati 50.000 - - - - - - 50.000 
30 P-030 Era puspitasari 50.000 - - - - - - 50.000 
31 P-031 Sutjipto 50.000 - - - - - - 50.000 
32 P-032 Titi Hari N 50.000 - - - - - - 50.000 
33 P-033 Suryawan Wisnu Broto - - - - - - - - 
34 P-034 Untung 50.000 - - - - - - 50.000 
35 P-035 Samingan 50.000 - - - - - - 50.000 
36 P-036 Dwi Astutik 50.000 - - - - - - 50.000 
37 P-037 Sulastri 50.000 - - - - - - 50.000 
38 P-038 Paini 50.000 - - - - - - 50.000 
39 P-039 M. Hilaluddin - - - - - - - - 
40 P-040 Kamdani 50.000 - - - - - - 50.000 
"""

POKOK_TEXT_P2 = """
41 P-041 Sumarmah 50.000 - - - - - - 50.000 
42 P-042 Suparno 50.000 - - - - - - 50.000 
43 P-043 Priokustanto 50.000 - - - - - - 50.000 
44 P-044 Vivi Diana 50.000 - - - - - - 50.000 
45 P-045 Lilik Farida 50.000 - - - - - - 50.000 
46 P-046 Riantin 50.000 - - - - - - 50.000 
47 P-047 Susi Purwanti 50.000 - - - - - - 50.000 
48 P-048 Slamet 50.000 - - - - - - 50.000 
49 P-049 Siti Khoiriyah 50.000 - - - - - - 50.000 
50 P-050 Parni - - - - - - - - 
51 P-051 Erika Dian 50.000 - - - - - - 50.000 
52 P-052 Sudarmi 50.000 - - - - - - 50.000 
53 P-053 Sutarti 50.000 - - - - - - 50.000 
54 P-054 Ika Purwati 50.000 - - - - - - 50.000 
55 P-055 Suliyah 50.000 - - - - - - 50.000 
56 P-056 Suparti 50.000 - - - - - - 50.000 
57 P-057 Winarti 50.000 - - - - - - 50.000 
58 P-058 Sunarsih 50.000 - - - - - - 50.000 
59 P-059 Jumadi 50.000 - - - - - - 50.000 
60 P-060 Lilik Iswati 50.000 - - - - - - 50.000 
61 P-061 Ajisoko 50.000 - - - - - - 50.000 
62 P-062 Endah 50.000 - - - - - - 50.000 
63 P-063 Ratna Budi S. 50.000 - - - - - - 50.000 
64 P-064 Winih I. 50.000 - - - - - - 50.000 
P-065 Budiono - - - - - - - - 
"""

WAJIB_TEXT_P3 = """
1 S-001 Sri Jayanti Sri Jayanti 390.000 30.000 - - - 30.000 - 420.000 
2 S-002 Adi Kuswantoro Adi Kuswantoro 330.000 - - - - - - 330.000 
3 S-003 Agus Ain Agus Ain - - - - - - - 
4 S-004 Alimah Alimah 240.000 - - - - - - 240.000 
5 S-005 Tri Yuliarsih Tri Yuliarsih 300.000 - - - - - - 300.000 
6 S-006 Kuswinarti Kuswinarti 360.000 30.000 - - - 30.000 - 390.000 
7 S-007 Hariyanto Hariyanto 300.000 - - - - - - 300.000 
8 S-008 Giyanto Giyanto 390.000 - - - 330.000 - 330.000 60.000 
9 S-009 Imroatus Sholichah Imroatus Sholichah 30.000 - - - - - - 30.000 
10 S-010 Teguh Prasetya Teguh Prasetya - - - - - - - - 
11 S-011 Djayos Djayos/sami 300.000 - - - - - - 300.000 
12 S-012 Sutriman Sutriman 360.000 - - 30.000 - 30.000 - 390.000 
13 S-013 Sasdji Abdullah Sasdji Abdullah - - - - - - - - 
14 S-014 M. Hadi Praitno M. Hadi Praitno 240.000 - - - - - - 240.000 
15 S-015 Anwar Wibisono Anwar Wibisono 240.000 30.000 - - - 30.000 - 270.000 
16 S-016 Choirul Anwar Choirul Anwar 300.000 - - - - - - 300.000 
17 S-017 Towardi Towardi 240.000 - - - - - - 240.000 
18 S-018 Choriyah Choriyah 330.000 - - - - - - 330.000 
19 S-019 Muji Santoso Muji Santoso 30.000 - - - - - - 30.000 
20 S-020 Muhammad Arifin Muhammad Arifin 330.000 30.000 - - - 30.000 - 360.000 
21 S-021 Tri Endah Tri Endah 270.000 - - - - - - 270.000 
22 S-022 Siti Nur afifa Siti Nur afifa 360.000 30.000 - - - 30.000 - 390.000 
23 S-023 Susi Sri Wahyuni Susi Sri Wahyuni 360.000 - - - - - - 360.000 
24 S-024 Hari Bayudi Hari Bayudi 300.000 30.000 - 60.000 - 90.000 - 390.000 
25 S-025 Ilham Hendrik Ilham Hendrik 330.000 30.000 - 30.000 - 60.000 - 390.000 
26 S-026 Abdul Rochman Abdul Rochman 180.000 - - - - - - 180.000 
27 S-027 Bagus Setiawan Bagus Setiawan 360.000 30.000 - - - 30.000 - 390.000 
28 S-028 Dwi Cahyorini Dwi Cahyorini 270.000 - - - - - - 270.000 
29 S-029 Mamik Kurianawati Mamik Kurianawati 240.000 - - - - - - 240.000 
30 S-030 Era puspitasari Era puspitasari 270.000 - - - - - - 270.000 
31 S-031 Sutjipto Sutjipto 300.000 30.000 - - - 30.000 - 330.000 
32 S-032 Titi Hari N Titi Hari N 360.000 - - - - - - 360.000 
33 S-033 Suryawan Wisnu Broto Suryawan Wisnu Broto - - - - - - - - 
34 S-034 Untung Untung 240.000 - - - - - - 240.000 
35 S-035 Samingan Samingan 210.000 - - - - - - 210.000 
36 S-036 Dwi Astutik Dwi Astutik 270.000 30.000 - - - 30.000 - 300.000 
37 S-037 Sulastri Sulastri 300.000 - - - - - - 300.000 
38 S-038 Paini Paini 210.000 - - - - - - 210.000 
39 S-039 M. Hilaluddin M. Hilaluddin - - - - - - - - 
40 S-040 Kamdani Kamdani 300.000 30.000 - 30.000 - 60.000 - 360.000 
"""

WAJIB_TEXT_P4 = """
41 S-041 Sumarmah Sumarmah 180.000 - - - - - - 180.000 
42 S-042 Suparno Pariyono 270.000 - - 30.000 - 30.000 - 300.000 
43 S-043 Priokustanto Priokustanto 240.000 30.000 - - - 30.000 - 270.000 
44 S-044 Vivi Diana Vivi Diana 420.000 60.000 - - - 60.000 - 480.000 
45 S-045 Lilik Farida Lilik Farida 270.000 - - - - - - 270.000 
46 S-046 Riantin Riantin 180.000 - - - - - - 180.000 
47 S-047 Susi Purwanti Susi Purwanti 150.000 - - - - - - 150.000 
48 S-048 Slamet Slamet 210.000 - - - - - - 210.000 
49 S-049 Siti Khoiriyah Siti Khoiriyah 210.000 - - 30.000 - 30.000 - 240.000 
50 S-050 Parni Parni - - - - - - 
51 S-051 Erika Dian Erika Dian 210.000 - - - - - - 210.000 
52 S-052 Sudarmi Sudarmi 210.000 - - - - - - 210.000 
53 S-053 Sutarti Sutarti 210.000 - - - - - - 210.000 
54 S-054 Ika Purwati Ika Purwati 180.000 - - - - - 180.000 
55 S-055 Suliyah Suliyah 240.000 - - - - - 240.000 
56 S-056 Warsiti Warsiti 210.000 30.000 - 30.000 - 60.000 270.000 
57 S-057 Suparti Suparti 210.000 - - - - - 210.000 
58 S-058 Sunarsih Sunarsih 120.000 30.000 - - - 30.000 150.000 
59 S-059 Jumadi Jumadi 120.000 - - - - - 120.000 
60 S-060 Lilik Iswati Lilik Indayati 180.000 30.000 - 60.000 - 90.000 270.000 
61 S-061 Ajisoko Ajisoko 150.000 - - - - - 150.000 
62 S-062 Endah Endang 210.000 30.000 - 30.000 - 60.000 270.000 
63 S-063 Ratna Budi S. Ratna Budi S. 120.000 - - - - - 120.000 
64 S-064 Winih I. Winih I. 120.000 - - - - - 120.000 
65 S-065 Budiono BUDIONO 60.000 30.000 - - - 30.000 90.000 
"""

def clean_number(num_str):
    if not num_str or num_str.strip() == '-' or num_str.strip() == '':
        return 0.0
    # Clean up formatting: e.g. "50.000" -> 50000.0
    cleaned = num_str.replace('.', '').strip()
    try:
        return float(cleaned)
    except ValueError:
        return 0.0

def parse_pokok():
    members_pokok = {}
    
    # Process page 1 & 2
    pokok_lines = (POKOK_TEXT_P1 + POKOK_TEXT_P2).strip().split('\n')
    for line in pokok_lines:
        line = line.strip()
        if not line:
            continue
        
        parts = [p.strip() for p in line.split() if p.strip()]
        if len(parts) >= 3:
            # Find the P-xxx code
            code = None
            code_idx = -1
            for idx, p in enumerate(parts):
                if p.startswith("P-"):
                    code = p
                    code_idx = idx
                    break
            
            if code:
                # Name parts are between code and the first numeric or '-'
                name_parts = []
                num_idx = -1
                for j in range(code_idx + 1, len(parts)):
                    if re.match(r'^\d{1,3}(\.\d{3})+$', parts[j]) or parts[j] == '-':
                        num_idx = j
                        break
                    else:
                        name_parts.append(parts[j])
                
                full_name = " ".join(name_parts)
                # Ending balance is the last token
                sisa_str = parts[-1]
                sisa = clean_number(sisa_str)
                
                members_pokok[code] = {
                    "name": full_name,
                    "pokok": sisa
                }
    return members_pokok

def parse_wajib():
    members_wajib = {}
    
    # Process page 3 & 4
    wajib_lines = (WAJIB_TEXT_P3 + WAJIB_TEXT_P4).strip().split('\n')
    for line in wajib_lines:
        line = line.strip()
        if not line:
            continue
        
        # Regex for wajib line: e.g., "1 S-001 Sri Jayanti Sri Jayanti 390.000 ..."
        # Column layout: No | Code | Name (twice or single) | Awal | Mei Masuk | Mei Keluar | Nov Masuk | Nov Keluar | Total Masuk | Total Keluar | Sisa
        # Note: Name is sometimes written twice (e.g. "Sri Jayanti Sri Jayanti" or "Djayos Djayos/sami")
        match = re.match(r'^(?:(\d+)\s+)?(S-\d+)\s+([A-Za-z\.\'\s\/]+?)\s+(?:[A-Za-z\.\'\s\/]+?\s+)?([\d\.\-]+|\-)\s+.*?\s+([\d\.\-]+|\-)$', line)
        
        # Standard splitting if regex is complex
        parts = [p.strip() for p in line.split() if p.strip()]
        if len(parts) >= 4:
            code = None
            for idx, p in enumerate(parts):
                if p.startswith("S-"):
                    code = p
                    code_idx = idx
                    break
            
            if code:
                # Name starts after S-xxx
                # Sisa is the last element
                # Saldo Awal is somewhere in the middle
                sisa_str = parts[-1]
                sisa = clean_number(sisa_str)
                
                # To find name and saldo awal safely
                # Name is between code and the first number or "-" that represents Saldo Awal
                name_parts = []
                awal_idx = -1
                for j in range(code_idx + 1, len(parts)):
                    # Check if parts[j] is a number (like 390.000) or '-'
                    if re.match(r'^\d{1,3}(\.\d{3})+$', parts[j]) or parts[j] == '-':
                        awal_idx = j
                        break
                    else:
                        name_parts.append(parts[j])
                
                # Deduplicate name (sometimes "Sri Jayanti Sri Jayanti" or "Djayos Djayos/sami")
                full_name = " ".join(name_parts)
                # Split in half if duplicate
                half_len = len(name_parts) // 2
                if half_len > 0 and name_parts[:half_len] == name_parts[half_len:]:
                    full_name = " ".join(name_parts[:half_len])
                
                awal_str = parts[awal_idx] if awal_idx != -1 else '-'
                awal = clean_number(awal_str)
                
                # Sisa is always the last token
                sisa = clean_number(parts[-1])
                
                members_wajib[code] = {
                    "name": full_name,
                    "awal": awal,
                    "wajib": sisa
                }

    return members_wajib

def main():
    print("=== STARTING PDF PARSER FOR SIMPAN PINJAM ===")
    pokok = parse_pokok()
    wajib = parse_wajib()
    
    # Merge datasets based on member index (001, 002, etc.)
    merged_members = []
    
    total_pokok = 0.0
    total_wajib = 0.0
    
    # We loop up to 65
    for i in range(1, 66):
        num_str = f"{i:03d}"
        p_code = f"P-{num_str}"
        s_code = f"S-{num_str}"
        
        p_data = pokok.get(p_code, {"name": f"Member {i}", "pokok": 0.0})
        w_data = wajib.get(s_code, {"name": p_data["name"], "awal": 0.0, "wajib": 0.0})
        
        name = p_data["name"] if p_data["name"] != f"Member {i}" else w_data["name"]
        
        total_pokok += p_data["pokok"]
        total_wajib += w_data["wajib"]
        
        merged_members.append({
            "code": f"M-{num_str}",
            "name": name,
            "simpananPokok": p_data["pokok"],
            "simpananWajib": w_data["wajib"]
        })
        
    print(f"Total Simpanan Pokok: {total_pokok:,.2f}")
    print(f"Total Simpanan Wajib: {total_wajib:,.2f}")
    
    # Write to seed JSON
    os.makedirs("prisma", exist_ok=True)
    json_path = "prisma/seed_members.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(merged_members, f, indent=2, ensure_ascii=False)
        
    print(f"=== PARSING COMPLETED! Saved {len(merged_members)} members to {json_path} ===")

if __name__ == "__main__":
    main()
