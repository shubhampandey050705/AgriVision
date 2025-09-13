import kaggle

def list_datasets(search_term="agriculture"):
    datasets = kaggle.api.dataset_list(search=search_term)
    return [{"title": d.title, "ref": d.ref} for d in datasets]
