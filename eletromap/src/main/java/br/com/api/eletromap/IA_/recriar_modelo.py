import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.pipeline import Pipeline
import joblib
import os

def gerar_modelo():
    diretorio_atual = os.path.dirname(os.path.abspath(__file__))
    MODEL_PATH = os.path.join(diretorio_atual, 'ia_postes_ensemble_v1.pkl')

    print("Treinando um novo modelo compátivel com o seu PC...")

    # 1. Dados simulados idênticos aos que o seu Java envia
    dados = pd.DataFrame({
        'Idade_Anos': [5, 40, 10, 35],
        'Temperatura_C': [25.0, 45.0, 30.0, 42.0],
        'Velocidade_Vento_kmh': [10.0, 110.0, 15.0, 90.0],
        'Carga_MW': [30.0, 85.0, 40.0, 80.0],
        'Dias_Ultima_Manutencao': [30, 800, 100, 700],
        'Condicao_Climatica': ['Ensolarado', 'Tempestade', 'Normal', 'Onda de Calor'],
        'Falha': [0, 1, 0, 1]  # 0 = Normal, 1 = Falha (O que a IA deve aprender)
    })

    X = dados.drop('Falha', axis=1)
    y = dados['Falha']

    # 2. Cria a estrutura (Pipeline) que o script original espera
    preprocessor = ColumnTransformer(
        transformers=[
            ('num', StandardScaler(), ['Idade_Anos', 'Temperatura_C', 'Velocidade_Vento_kmh', 'Carga_MW', 'Dias_Ultima_Manutencao']),
            ('cat', OneHotEncoder(handle_unknown='ignore'), ['Condicao_Climatica'])
        ])

    modelo = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', RandomForestClassifier(n_estimators=10, random_state=42))
    ])

    # 3. Treina a IA e substitui o arquivo .pkl antigo pelo novo
    modelo.fit(X, y)
    joblib.dump(modelo, MODEL_PATH)

    print(f"✅ Sucesso! Novo 'ia_postes_ensemble_v1.pkl' gerado na versão 1.9.0.")

if __name__ == '__main__':
    gerar_modelo()