package com.hiddensignal.scanner.ui

import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.TextView
import androidx.recyclerview.widget.RecyclerView
import com.hiddensignal.scanner.R
import com.hiddensignal.scanner.data.DeviceEntity
import java.text.SimpleDateFormat
import java.util.*

class DeviceAdapter(
    private var items: List<DeviceEntity> = emptyList(),
    private val onClick: (DeviceEntity) -> Unit
) : RecyclerView.Adapter<DeviceAdapter.VH>() {

    private val dateFormat = SimpleDateFormat("dd/MM HH:mm", Locale.getDefault())

    class VH(view: View) : RecyclerView.ViewHolder(view) {
        val title: TextView = view.findViewById(R.id.textTitle)
        val subtitle: TextView = view.findViewById(R.id.textSubtitle)
    }

    fun submit(newItems: List<DeviceEntity>) {
        items = newItems
        notifyDataSetChanged()
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): VH {
        val view = LayoutInflater.from(parent.context).inflate(R.layout.item_device, parent, false)
        return VH(view)
    }

    override fun onBindViewHolder(holder: VH, position: Int) {
        val d = items[position]
        holder.title.text = d.label ?: d.name ?: d.address
        val tipo = if (d.type.name == "BLE") "Bluetooth" else "WiFi"
        holder.subtitle.text = "$tipo · ${d.lastRssi} dBm · visto ${d.timesSeen}x · ${dateFormat.format(Date(d.lastSeen))}"
        holder.itemView.setOnClickListener { onClick(d) }
    }

    override fun getItemCount() = items.size
}
