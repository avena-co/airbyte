from fastapi import FastAPI
from nameparser import HumanName

app = FastAPI()


@app.get("/status")
def read_root():
    return {"healthy": True}


@app.get("/extract_name_components/{full_name}")
def extract_name_components(full_name: str):
    name = HumanName(full_name)

    return name.as_dict()
