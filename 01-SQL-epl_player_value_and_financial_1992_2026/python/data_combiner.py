import os
import pandas as pd
import glob

folder = r"C:\Users\Admin\Desktop\archive\DATA_CSV"
all_data = []
print("Start")
for ss_folder in os.listdir(folder):
    ss_path = os.path.join(folder, ss_folder)

    if (os.path.isdir(ss_path)):
        csv_files = glob.glob(os.path.join(ss_path, "*.csv"))
        for file in csv_files:
            df = pd.read_csv(file)
            club_name = os.path.basename(file).replace('.csv', '')
            df['Season'] = ss_folder.replace('Season_', '')
            df['Club'] = club_name

            all_data.append(df)

master_df = pd.concat(all_data, ignore_index=True)
master_df.to_csv("Master_PremierLeague_1992_2026.csv", index=False)
print("End")