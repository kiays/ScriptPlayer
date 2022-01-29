#pragma once
#include <QBluetoothDeviceDiscoveryAgent>
#include <QDebug>
#include <QObject>
#include <QThread>

class SenderThread : public QThread {
  //   Q_OBJECT
public:
  SenderThread(QObject *parent = nullptr) : QThread(parent){};

protected:
  void run() override {
    qDebug() << "Sender Thread run";
    qDebug() << "BLE Thread";

    // emit resultReady(QString(""));
  };
public slots:
  void addDevice(const QBluetoothDeviceInfo &info) { qDebug() << "add device: "; };
  void scanError(QBluetoothDeviceDiscoveryAgent::Error error) { qDebug() << "scan Error"; };
  void scanFinished() { qDebug() << "scan finished"; }
  // signals:
  //   void resultReady(const QString &s);

private:
};