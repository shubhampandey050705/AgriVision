# training/train_disease.py
import tensorflow as tf
from tensorflow.keras.applications import EfficientNetB0
from tensorflow.keras import layers, models
from pathlib import Path

DATA = Path(__file__).resolve().parents[1] / "data"
MODELS = Path(__file__).resolve().parents[1] / "models"

IMG_SIZE = (224, 224)
BATCH = 32
EPOCHS = 12

def build_model(num_classes):
    base = EfficientNetB0(include_top=False, input_shape=IMG_SIZE+(3,), weights="imagenet")
    base.trainable = False
    inputs = layers.Input(shape=IMG_SIZE+(3,))
    x = tf.keras.applications.efficientnet.preprocess_input(inputs)
    x = base(x, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.Dropout(0.2)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)
    model = models.Model(inputs, outputs)
    model.compile(optimizer="adam", loss="sparse_categorical_crossentropy", metrics=["accuracy"])
    return model, base

def main():
    # Directory structure:
    # data/leaves/train/<class_name>/*.jpg
    # data/leaves/val/<class_name>/*.jpg
    train_ds = tf.keras.preprocessing.image_dataset_from_directory(
        DATA / "leaves/train", image_size=IMG_SIZE, batch_size=BATCH)
    val_ds = tf.keras.preprocessing.image_dataset_from_directory(
        DATA / "leaves/val", image_size=IMG_SIZE, batch_size=BATCH)

    num_classes = train_ds.cardinality().numpy() and len(train_ds.class_names)
    model, base = build_model(num_classes)

    # warmup
    model.fit(train_ds, validation_data=val_ds, epochs=EPOCHS)

    # optional fine-tune top blocks
    base.trainable = True
    for layer in base.layers[:-40]:  # unfreeze last ~40 layers
        layer.trainable = False
    model.compile(optimizer=tf.keras.optimizers.Adam(1e-5),
                  loss="sparse_categorical_crossentropy",
                  metrics=["accuracy"])
    model.fit(train_ds, validation_data=val_ds, epochs=6)

    MODELS.mkdir(exist_ok=True)
    model.save(MODELS / "disease_efficientnet_v1.keras")
    (MODELS / "disease_labels.json").write_text(
        tf.constant(train_ds.class_names).numpy().tolist().__repr__()
    )
    print("Saved disease model.")
if __name__ == "__main__":
    main()
