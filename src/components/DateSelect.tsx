import React, { useState, useRef, useEffect } from "react";
import {
  IonModal,
  IonItem,
  IonInput,
  IonDatetime,
} from "@ionic/react";
import _ from "lodash";
import { Timestamp } from "firebase/firestore";
import dayjs from "dayjs";

interface ModalSelectProps {
  value: string;
  placeholder?: string;
  name: string;
  onIonChange?: (e: React.ChangeEvent<any>) => void;
  onDateClick?: (value: string) => void;
  onIonBlur: (e: React.FocusEvent<any, Element>) => void;
  label: string;
}

function DateSelect({
  value,
  placeholder,
  onIonChange,
  onDateClick,
  label,
  name,
}: ModalSelectProps) {
  const modal = useRef<HTMLIonModalElement>(null);
  const [isOpen, setIsOpen] = useState(false);

const date = new Date(value);
  const dateTime = Timestamp.fromDate(new Date(value));


  return (
    <>
      <IonItem>
        <IonInput label="Date" onIonFocus={() => setIsOpen(true)} value={dayjs(value).format('DD/MM/YYYY')}></IonInput>
      </IonItem>
      <IonModal
        ref={modal}
        isOpen={isOpen}
        onWillDismiss={() => setIsOpen(false)}
        keepContentsMounted={true}
      >
        <IonDatetime
          id="datetime"
          name={name}
          value={value}
          onIonChange={(e: any) => {
           onDateClick?.(e.target.value)
           onIonChange?.(e);
           setIsOpen(false);
          }}
          presentation="date"
        />
      </IonModal>
    </>
  );
}

export default DateSelect;
