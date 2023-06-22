import React, { useState, useRef, useEffect, ReactNode } from "react";
import {
  IonButtons,
  IonButton,
  IonModal,
  IonHeader,
  IonContent,
  IonToolbar,
  IonTitle,
  IonItem,
  IonLabel,
  IonList,
  IonIcon,
  IonSearchbar,
  IonCheckbox,
} from "@ionic/react";
import { OverlayEventDetail } from "@ionic/core/components";
import _ from "lodash";
import { caretDown, checkboxOutline, squareOutline } from "ionicons/icons";

interface ModalSelectProps {
  options: { name: string; value: string; extra?: string | ReactNode }[];
  value: string;
  onConfirm?: (val: string) => void;
  placeholder?: string;
  name: string;
  label: string;
}

function ModalSelect({
  options,
  value,
  onConfirm,
  placeholder,
  label,
}: ModalSelectProps) {
  const modal = useRef<HTMLIonModalElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  function confirm() {
    onConfirm?.(localValue);
    setIsOpen(false);
    setSearchTerm("");
  }

  function cancel() {
    setIsOpen(false);
    setLocalValue(value);
    setSearchTerm("");
  }

  return (
    <>
      <IonItem
        className="cursor-pointer w-full"
        onClick={() => setIsOpen(true)}
      >
        <IonLabel>{label}</IonLabel>
        <IonItem slot="end">
          <IonLabel>
            {value ? _.find(options, { value })?.name : placeholder}
          </IonLabel>
          <IonIcon aria-hidden="true" icon={caretDown} />
        </IonItem>
      </IonItem>
      <IonModal ref={modal} isOpen={isOpen} onWillDismiss={() => cancel()}>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonButton onClick={() => modal.current?.dismiss()}>
                Cancel
              </IonButton>
            </IonButtons>
            <IonTitle>Select a {label} </IonTitle>
            <IonButtons slot="end">
              <IonButton strong={true} onClick={() => confirm()}>
                Confirm
              </IonButton>
            </IonButtons>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonItem>
            <IonSearchbar
              onIonInput={(e) => setSearchTerm(e.target.value ?? "")}
              placeholder={`Search ${label}`}
            ></IonSearchbar>
          </IonItem>
          <IonList>
            {_(options)
              .filter((option) =>
                _.size(searchTerm) > 1
                  ? _.includes(
                      _.lowerCase(option.name),
                      _.lowerCase(searchTerm)
                    )
                  : true
              )
              .map((option) => (
                <IonItem
                  onClick={() => setLocalValue(option.value)}
                  key={option.value}
                  detail={true}
                  detailIcon={
                    option.value === localValue
                      ? checkboxOutline
                      : squareOutline
                  }
                  className="cursor-pointer"
                >
                  <IonLabel>
                    <h4>{option.name}</h4>
                    <p>{option.extra}</p>
                  </IonLabel>
                </IonItem>
              ))
              .value()}
          </IonList>
        </IonContent>
      </IonModal>
    </>
  );
}

export default ModalSelect;
