import streamlit as st
from bs4 import BeautifulSoup
from streamlit_tags import st_tags
import spacy
from scispacy.linking import EntityLinker
from scispacy.abbreviation import AbbreviationDetector

model_entity_names = {
    "en_core_med7_lg": ['DOSAGE', 'DRUG', 'DURATION', 'FORM', 'FREQUENCY', 'ROUTE', 'STRENGTH'],
    "en_ner_bc5cdr_md": ["CHEMICAL", "DISEASE"],
    "en_ner_bionlp13cg_md": ['AMINO_ACID','ANATOMICAL_SYSTEM','CANCER','CELL','CELLULAR_COMPONENT','DEVELOPING_ANATOMICAL_STRUCTURE','GENE_OR_GENE_PRODUCT','IMMATERIAL_ANATOMICAL_ENTITY','MULTI_TISSUE_STRUCTURE','ORGAN','ORGANISM','ORGANISM_SUBDIVISION','ORGANISM_SUBSTANCE','PATHOLOGICAL_FORMATION','SIMPLE_CHEMICAL','TISSUE'],
    "en_ner_jnlpba_md": ['CELL_LINE', 'CELL_TYPE', 'DNA', 'PROTEIN', 'RNA'],
    "en_ner_craft_md": ['CHEBI', 'CL', 'GGP', 'GO', 'SO', 'TAXON']
}

@st.cache(allow_output_mutation=True)
def load_model_and_linker():
    nlp = spacy.load("en_core_sci_lg")
    nlp.add_pipe("scispacy_linker", config={"resolve_abbreviations": True, "linker_name": "umls"})
    linker = nlp.get_pipe("scispacy_linker")
    return nlp, linker

def main():
    nlp, linker = load_model_and_linker()
    st.title("Healthwagon")

    model_selection = st.sidebar.selectbox("Clinical NER models", list(model_entity_names.keys()))

    entity_names = model_entity_names[model_selection]
    st.sidebar.write("Clinical Entities:")
    with st.sidebar:
        keywords = st_tags(entity_names, label='', text='')

    input_text = st.text_input("Enter Medical/Clinical Transcriptions/Summaries")

    if st.button("Analyze"):
        analyze_text(input_text, model_selection,nlp,linker)

def analyze_text(text, model,nlp,linker):
    nlp1 = spacy.load(model)
    nlp1.add_pipe("abbreviation_detector")
    #Token.set_extension("negex", default=False)
    doc = nlp1(text)

    col_dict = {}
    seven_colours = ['#e6194B', '#3cb44b', '#ffe119', '#ffd8b1', '#f58231', '#f032e6', '#42d4f4']
    for label, colour in zip(nlp1.pipe_labels['ner'], seven_colours):
        col_dict[label] = colour

    options = {'ents': nlp1.pipe_labels['ner'], 'colors': col_dict, 'compact': True}

    html_content = spacy.displacy.render(doc, style='ent', options=options, page=True)
   
    # Use BeautifulSoup to extract content inside the <div class="entities"> tag
    soup = BeautifulSoup(html_content, 'html.parser')
    entities_html = str(soup.find('div', class_='entities'))
    st.write("")
    st.write("")
    st.markdown("****CLinical NER-8****")
    # Display the extracted content in Streamlit
    st.markdown(entities_html, unsafe_allow_html=True)
    entities=[(ent.text, ent.label_) for ent in doc.ents]
    st.write("")
    st.write("")
    st.markdown("****Abbreviation****")
    abbreviations = []
    long_forms = []
    for abrv in doc._.abbreviations:
        abbreviations.append(str(abrv))
        long_forms.append(str(abrv._.long_form))
    if abbreviations:
        # Display the data in a table
        data = {'Abbreviation': abbreviations, 'Long Form': long_forms}
        st.table(data)
    else:
        st.write("No abbreviations found.")
    
    # if neg_entities:
    #     st.write(neg_entities)
    # else:
    #     st.write("No negated entities found.")
    st.write("")
    st.write("")
    st.markdown("****Entity Linking****")
    filtered_entities = [ent[0] for ent in entities if ent[1] in model_entity_names[model]]
    entity_list=[]
    canonical_list=[]
    definitions_list=[]
    # concept_list=[]
    # TUI_list=[]
    doc = nlp(text)
    # temp=list(set(doc.ents))
    # print(temp)
    for entity in doc.ents: 
        if str(entity) in filtered_entities:
            for umls_ent in entity._.kb_ents:
                entity_info = linker.kb.cui_to_entity.get(umls_ent[0])
                if entity_info:
                    if entity.text not in entity_list:
                        entity_list.append(entity.text)
                        canonical_list.append(entity_info[1])
                        definitions_list.append(entity_info[4])
                        # concept_list.append(entity_info[0])
                        # TUI_list.append(entity_info[3][0])
                        break
            # else:
            #     # If linker doesn't have information for this entity, append empty strings
            #     entity_list.append(entity.text)
            #     canonical_list.append("")
            #     concept_list.append("")
            #     TUI_list.append("")
    data = {
            "Entity":entity_list,
            "Canonical Name": canonical_list,
            "Definition":definitions_list
            # "Concept ID": concept_list,
            # "TUI (s)": TUI_list
    }
    st.table(data)


if __name__ == "__main__":
    main()
