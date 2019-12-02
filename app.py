import json

from flask import Flask, render_template

import numpy as np # linear algebra
import pandas as pd # data processing, CSV file I/O (e.g. pd.read_csv)

app = Flask(__name__)

@app.route("/")
def index():
    df = pd.read_csv('data.csv')
    print(df)

# drop null values
    df.dropna(inplace=True)
# drop duplicates
    df.drop_duplicates(inplace=True)

    df = df.reset_index()
    print(df)

# Rescaling, getting the data in a consistent manner, we should be consistent on using one measure Unit, be it seconds, milliseconds or else. In this case I chose milliseconds.
    df.loc[df['Unit']=='op/s', ['Old', 'New']] /= 1000
    df.loc[df['Unit']=='op/us', ['Old', 'New']] *= 1000
    df.loc[df['Unit']=='op/ns', ['Old', 'New']] *= 1000000
    df.loc[df['Unit']=='s/op', ['Old', 'New']] *= 1000
    df.loc[df['Unit']=='us/op', ['Old', 'New']] /= 1000
    df.loc[df['Unit']=='ns/op', ['Old', 'New']] /= 1000000

    print(df)

# Change the names of Unit to op/ms
    df.loc[df['Unit'] == "op/s", 'Unit'] = "op/ms"
#     df.loc[df['Unit'] == "op/us", 'Unit'] = "op/ms"
#     df.loc[df['Unit'] == "op/ns", 'Unit'] = "op/ms"
#
    df.loc[df['Unit'] == "s/op", 'Unit'] = "ms/op"
#     df.loc[df['Unit'] == "us/op", 'Unit'] = "ms/op"
#     df.loc[df['Unit'] == "ns/op", 'Unit'] = "ms/op"

#     df["Old"]=((df["Old"]-df["Old"].min())/(df["Old"].max()-df["Old"].min()))*1
#     df["New"]=((df["New"]-df["New"].min())/(df["New"].max()-df["New"].min()))*1

    df1 = df[df['Unit'].str.match('op/ms')]
    op_ms_data = df1.to_dict(orient='records')
    op_ms_data = json.dumps(op_ms_data, indent=2)

    df2 = df[df['Unit'].str.match('ms/op')]
    ms_op_data = df2.to_dict(orient='records')
    ms_op_data = json.dumps(ms_op_data, indent=2)

#     print(df1)
#     print(df1['Old'].sum())

#     calcPerformance = df1.Old.sum()/df1.New.sum()
#     print(calcPerformance)
#     increaseInPerformance = ((oldBenchmark-newBenchmark)/newBenchmark) * 100
#     print(increaseInPerformance)

# Get the sum for operations per millisecond
    oldBenchmark_df1 = df1['Old'].sum()
    newBenchmark_df1 = df1['New'].sum()

# Get the sum for milliseconds per operation
    oldBenchmark_df2 = df2['Old'].sum()
    newBenchmark_df2 = df2['New'].sum()

    calcPerformance_op_ms = ((newBenchmark_df1-oldBenchmark_df1)/oldBenchmark_df1)*100
    calcPerformance_ms_op = ((newBenchmark_df2-oldBenchmark_df2)/oldBenchmark_df2)*100

    print(calcPerformance_op_ms)
    print(calcPerformance_ms_op)

    data = {'op_ms_data': op_ms_data, 'ms_op_data': ms_op_data, 'calcPerformance_op_ms': calcPerformance_op_ms, 'calcPerformance_ms_op': calcPerformance_ms_op}


    return render_template("index.html", data=data)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port =5000)